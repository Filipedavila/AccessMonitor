/**
 * Configuração central do backend. `VITE_API_URL` é a origem do backend,
 * sem o prefixo `/amp` (ex.: http://localhost:3000).
 */
export const API_URL: string = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? ''
).replace(/\/+$/, '');

export const API_PATHS = {
  stream: '/amp/eval/stream',
  html: '/amp/eval/html',
  file: '/amp/eval/file',
} as const;

/** Limites validados no cliente antes de enviar (o servidor valida de novo). */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
