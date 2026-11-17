import { API_PATHS, API_URL } from '../config/api';
import type { StreamEvent } from '../types';
import { createSseParser } from './sse';

/** Erro HTTP devolvido antes de o stream abrir (400/403/413/429...). */
export class EvaluationHttpError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'EvaluationHttpError';
    this.status = status;
  }
}

const EVENT_NAMES = new Set(['queued', 'processing', 'completed', 'failed']);

async function readHttpError(res: Response): Promise<EvaluationHttpError> {
  const body = (await res.json().catch(() => ({}))) as { message?: unknown };
  const message = Array.isArray(body.message)
    ? body.message.join('; ')
    : String(body.message ?? res.statusText);
  return new EvaluationHttpError(message, res.status);
}

/**
 * Faz o pedido e lê o stream SSE até `completed`/`failed` ou até o
 * `signal` abortar (o que cancela a avaliação no servidor).
 * `fetch` em vez de `EventSource`: não reconecta sozinho (evita avaliações
 * duplicadas), suporta POST e expõe o erro HTTP.
 */
export async function streamEvaluation(
  path: string,
  init: RequestInit,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    signal,
    headers: { Accept: 'text/event-stream', ...init.headers },
  });
  if (!res.ok) throw await readHttpError(res);
  if (!res.body) throw new TypeError('Resposta sem corpo');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let finished = false;
  const parser = createSseParser(({ event, data }) => {
    if (finished || !EVENT_NAMES.has(event)) return;
    const parsed = { event, data: JSON.parse(data) } as StreamEvent;
    finished = parsed.event === 'completed' || parsed.event === 'failed';
    onEvent(parsed);
  });

  try {
    while (!finished) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.push(decoder.decode(value, { stream: true }));
    }
  } finally {
    // Fecha a ligação: nunca esperar pelo fecho do servidor.
    await reader.cancel().catch(() => undefined);
  }
  if (!finished) throw new TypeError('Ligação terminada antes do resultado');
}

export const evaluateUrlStream = (
  url: string,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> =>
  streamEvaluation(
    `${API_PATHS.stream}?url=${encodeURIComponent(url)}`,
    { method: 'GET' },
    onEvent,
    signal,
  );

export const evaluateHtmlStream = (
  html: string,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> =>
  streamEvaluation(
    API_PATHS.html,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html }),
    },
    onEvent,
    signal,
  );

export const evaluateFileStream = (
  file: File,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> => {
  const form = new FormData();
  form.append('file', file);
  // Sem Content-Type manual: o browser acrescenta o boundary.
  return streamEvaluation(
    API_PATHS.file,
    { method: 'POST', body: form },
    onEvent,
    signal,
  );
};
