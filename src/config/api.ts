import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import dataJSON from '../utils/data.json';
import type { EvaluationResponse } from '../types/report';
export interface AppConfig {
  REACT_APP_AMP_SERVER: string;
  REACT_APP_API_DATA_SOURCE: string;
}

let cachedConfig: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('/config.json');
    if (!response.ok) {
      throw new Error('Failed to load runtime configuration');
    }
    cachedConfig = (await response.json()) as AppConfig;
    return cachedConfig;
  } catch (error) {
    console.warn(
      'Could not load /config.json, using process.env fallbacks:',
      error,
    );
    cachedConfig = {
      REACT_APP_AMP_SERVER: import.meta.env.VITE_AMP_SERVER || '',
      REACT_APP_API_DATA_SOURCE: import.meta.env.VITE_API_DATA_SOURCE || 'api',
    };
    return cachedConfig;
  }
}

export const api: AxiosInstance = axios.create();

// Interceptor ensures the baseURL is always populated from runtime config
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const runtimeConfig = await loadConfig();
  if (runtimeConfig?.REACT_APP_AMP_SERVER) {
    config.baseURL = runtimeConfig.REACT_APP_AMP_SERVER;
  }
  return config;
});

/**
 * Evaluates HTML content string via API
 */
export const evaluateHtml = async (
  html: string,
): Promise<EvaluationResponse> => {
  const config = await loadConfig();
  if (config.REACT_APP_API_DATA_SOURCE === 'local') {
    return dataJSON as unknown as EvaluationResponse;
  }
  const response = await api.post<EvaluationResponse>('/eval/html', { html });
  return response.data;
};

/**
 * Evaluates a web page by URL via API
 */
export const evaluateUrl = async (url: string): Promise<EvaluationResponse> => {
  const config = await loadConfig();
  if (config.REACT_APP_API_DATA_SOURCE === 'local') {
    return dataJSON as unknown as EvaluationResponse;
  }
  const response = await api.get<EvaluationResponse>(
    `/eval/${encodeURIComponent(url)}`,
  );
  return response.data;
};

/**
 * Backwards-compatible evaluation entrypoint
 */
export const getEvalData = async (
  type: 'html' | 'url',
  target: string,
): Promise<EvaluationResponse> => {
  if (type === 'html') {
    return evaluateHtml(target);
  }
  return evaluateUrl(target);
};
