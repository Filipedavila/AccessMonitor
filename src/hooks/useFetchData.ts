import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { evaluateHtml, evaluateUrl } from '../config/api';
import { processData } from '../services';
import type {
  EvaluationResponse,
  ProcessedDataFull,
  ErrorType,
} from '../types';

export interface UseFetchDataResult {
  dataProcess: ProcessedDataFull | null;
  loadingProgress: boolean;
  originalData: EvaluationResponse | null;
  pageCode: string | undefined;
  error: ErrorType | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
}

function mapErrorToType(error: unknown): ErrorType {
  if (isAxiosError(error)) {
    // No response means the request never reached the server
    // (connection refused, DNS failure, CORS, timeout, etc.)
    if (!error.response) return 'network';
    const status = error.response.status;
    if (status === 400 || status === 404 || status === 422) {
      return 'invalid_url';
    }
    if (status >= 500) return 'server';
    return 'unexpected';
  }
  if (error instanceof TypeError) return 'network';
  if (error instanceof SyntaxError) return 'parse';
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('invalid') || message.includes('url')) {
      return 'invalid_url';
    }
    if (message.includes('parse') || message.includes('json')) {
      return 'parse';
    }
    if (message.includes('server') || message.includes('status')) {
      return 'server';
    }
  }
  return 'unexpected';
}

export const evaluationQueryKey = (
  type: 'html' | 'url',
  target: string,
): readonly ['evaluation', 'html' | 'url', string] =>
  ['evaluation', type, target] as const;

export const useFetchData = (
  content: string | undefined,
  contentHtml: string,
  decodedUrl: string,
): UseFetchDataResult => {
  const isHtml = content === 'html';
  const currentTarget = isHtml ? contentHtml : decodedUrl;
  const type: 'html' | 'url' = isHtml ? 'html' : 'url';
  const queryClient = useQueryClient();

  const query = useQuery<EvaluationResponse>({
    queryKey: evaluationQueryKey(type, currentTarget),
    queryFn: async (): Promise<EvaluationResponse> =>
      isHtml ? evaluateHtml(contentHtml) : evaluateUrl(decodedUrl),
    enabled: Boolean(currentTarget),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  const originalData = query.data ?? null;

  const dataProcess = useMemo<ProcessedDataFull | null>(() => {
    if (!originalData?.evaluationReport) return null;
    return processData(originalData.evaluationReport, currentTarget);
  }, [originalData, currentTarget]);

  const pageCode = originalData?.evaluationReport?.snapshot?.html || 'html';

  const error: ErrorType | null = query.isError
    ? mapErrorToType(query.error)
    : null;

  const refetch = async (): Promise<void> => {
    await query.refetch();
  };

  const invalidate = async (): Promise<void> => {
    await queryClient.removeQueries({
      queryKey: evaluationQueryKey(type, currentTarget),
    });
    await query.refetch();
  };

  return {
    dataProcess,
    loadingProgress: query.isLoading || query.isFetching,
    originalData,
    pageCode,
    error,
    refetch,
    invalidate,
  };
};

export default useFetchData;
