import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EvaluationHttpError,
  evaluateFileStream,
  evaluateHtmlStream,
  evaluateUrlStream,
} from '../services/evaluationStream';
import { processData } from '../services';
import type {
  AuditReport,
  ErrorType,
  EvaluationState,
  FailedEvent,
  ProcessedDataFull,
  StreamEvent,
} from '../types';

export interface UseFetchDataResult {
  dataProcess: ProcessedDataFull | null;
  loadingProgress: boolean;
  /** Estado do ciclo de vida SSE: idle → queued → processing → completed | failed. */
  evaluation: EvaluationState;
  originalData: AuditReport | null;
  pageCode: string | undefined;
  error: ErrorType | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
  /** Cancela a avaliação em curso (fecha a ligação; o servidor liberta o slot). */
  cancel: () => Promise<void>;
}

/** `failed` emitido pelo backend dentro do stream. */
export class EvaluationFailure extends Error {
  readonly failure: FailedEvent;
  constructor(failure: FailedEvent) {
    super(failure.message);
    this.name = 'EvaluationFailure';
    this.failure = failure;
  }
}

function mapErrorToType(error: unknown): ErrorType {
  if (error instanceof EvaluationFailure) {
    return error.failure.code === 'EVALUATION_TIMEOUT'
      ? 'timeout'
      : 'evaluation_failed';
  }
  if (error instanceof EvaluationHttpError) {
    switch (error.status) {
      case 400:
        return 'invalid_url';
      case 403:
        return 'forbidden';
      case 413:
        return 'too_large';
      case 429:
        return 'rate_limited';
      default:
        return error.status >= 500 ? 'server' : 'unexpected';
    }
  }
  if (error instanceof SyntaxError) return 'parse';
  // fetch rejeita com TypeError em falhas de rede / CORS / ligação cortada
  if (error instanceof TypeError) return 'network';
  return 'unexpected';
}

function toFailedState(error: unknown): EvaluationState {
  if (error instanceof EvaluationFailure) {
    return { phase: 'failed', error: error.failure };
  }
  if (error instanceof EvaluationHttpError) {
    return {
      phase: 'failed',
      error: { code: 'HTTP', message: error.message, status: error.status },
    };
  }
  return {
    phase: 'failed',
    error: {
      code: 'NETWORK',
      message: error instanceof Error ? error.message : 'Ligação perdida',
    },
  };
}

type Target = 'html' | 'url';

export const evaluationQueryKey = (
  type: Target,
  target: string,
): readonly ['evaluation', Target, string] =>
  ['evaluation', type, target] as const;

/** Chave estável para ficheiros submetidos (File não é serializável). */
export const fileQueryTarget = (file: File): string =>
  `file:${file.name}:${file.size}:${file.lastModified}`;

export const useFetchData = (
  content: string | undefined,
  contentHtml: string,
  decodedUrl: string,
  file?: File | null,
): UseFetchDataResult => {
  const isHtml = content === 'html';
  const type: Target = isHtml ? 'html' : 'url';
  const currentTarget = isHtml
    ? file
      ? fileQueryTarget(file)
      : contentHtml
    : decodedUrl;
  const queryKey = evaluationQueryKey(type, currentTarget);
  const queryClient = useQueryClient();
  const [stream, setStream] = useState<EvaluationState>({ phase: 'idle' });

  const query = useQuery<AuditReport>({
    queryKey,
    // `signal` é abortado quando o último observador sai (unmount/mudança
    // de pedido) ou em cancelQueries: fecha o fetch e cancela no servidor.
    queryFn: async ({ signal }): Promise<AuditReport> => {
      let report: AuditReport | undefined;
      let failure: FailedEvent | undefined;
      setStream({ phase: 'idle' });

      const onEvent = (ev: StreamEvent): void => {
        switch (ev.event) {
          case 'queued':
            setStream({ phase: 'queued', queue: ev.data });
            break;
          case 'processing':
            setStream({ phase: 'processing', info: ev.data });
            break;
          case 'completed':
            report = ev.data;
            break;
          case 'failed':
            failure = ev.data;
            break;
        }
      };

      if (isHtml && file) await evaluateFileStream(file, onEvent, signal);
      else if (isHtml) await evaluateHtmlStream(contentHtml, onEvent, signal);
      else await evaluateUrlStream(decodedUrl, onEvent, signal);

      if (failure) throw new EvaluationFailure(failure);
      if (!report) throw new SyntaxError('Resposta sem relatório');

      if (isHtml) {
        // Os ecrãs de detalhe/código navegam com o `snapshot.html` como
        // origem: semear essa chave evita reavaliar a mesma página.
        queryClient.setQueryData(
          evaluationQueryKey('html', report.snapshot.html),
          report,
        );
      }
      return report;
    },
    enabled: Boolean(currentTarget),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false, // um pedido por avaliação: nunca reavaliar em silêncio
    throwOnError: false,
  });

  const originalData = query.data ?? null;

  const dataProcess = useMemo<ProcessedDataFull | null>(
    () => (originalData ? processData(originalData, currentTarget) : null),
    [originalData, currentTarget],
  );

  const pageCode = originalData?.snapshot?.html || 'html';

  const error: ErrorType | null = query.isError
    ? mapErrorToType(query.error)
    : null;

  const evaluation: EvaluationState = originalData
    ? { phase: 'completed', report: originalData }
    : query.isError
      ? toFailedState(query.error)
      : stream;

  const refetch = useCallback(async (): Promise<void> => {
    await query.refetch();
  }, [query]);

  const invalidate = useCallback(async (): Promise<void> => {
    queryClient.removeQueries({ queryKey });
    await query.refetch();
  }, [queryClient, queryKey, query]);

  const cancel = useCallback(async (): Promise<void> => {
    await queryClient.cancelQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    dataProcess,
    loadingProgress: query.isLoading || query.isFetching,
    evaluation,
    originalData,
    pageCode,
    error,
    refetch,
    invalidate,
    cancel,
  };
};

export default useFetchData;
