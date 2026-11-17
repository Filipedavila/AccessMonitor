export * from './report';
export * from './evaluation';

export type Theme = 'light' | 'dark';

export type ErrorType =
  | 'network'
  | 'invalid_url'
  | 'server'
  | 'parse'
  | 'unexpected'
  | 'timeout'
  | 'evaluation_failed'
  | 'forbidden'
  | 'too_large'
  | 'rate_limited';
