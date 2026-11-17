import type { AuditReport } from './report';

/** Evento SSE `queued`: todos os slots estão ocupados. */
export interface QueuedEvent {
  status: 'waiting';
  queuePosition: number;
  activeSlots: number;
  maxSlots: number;
}

/** Evento SSE `processing`: a avaliação começou. */
export interface ProcessingEvent {
  status: 'evaluating';
  url?: string;
  type?: 'html';
}

export type FailedCode =
  | 'EVALUATION_TIMEOUT'
  | 'EVALUATION_FAILED'
  | 'EVALUATION_ABORTED';

/** Evento SSE `failed`: erro estruturado emitido pelo backend. */
export interface FailedEvent {
  status: 'failed';
  code: FailedCode;
  message: string;
}

/** Erros que nunca chegam por SSE (rede, HTTP antes do stream). */
export interface ClientError {
  code: 'NETWORK' | 'HTTP';
  message: string;
  status?: number;
}

export type EvaluationState =
  | { phase: 'idle' }
  | { phase: 'queued'; queue: QueuedEvent }
  | { phase: 'processing'; info: ProcessingEvent }
  | { phase: 'completed'; report: AuditReport }
  | { phase: 'failed'; error: FailedEvent | ClientError };

/** Tipos de eventos SSE relevantes (o `ping` é filtrado pelo cliente). */
export type StreamEvent =
  | { event: 'queued'; data: QueuedEvent }
  | { event: 'processing'; data: ProcessingEvent }
  | { event: 'completed'; data: AuditReport }
  | { event: 'failed'; data: FailedEvent };
