import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL } from "../config";
import { logger } from "./logger";

export interface HttpError extends Error {
  status?: number;
}

/*
 * Extracts a normalised error from any Axios failure and re-throws it as
 * an HttpError with a `status` property. Typed as `never` so TypeScript
 * knows the call site always throws - no return value is possible.
 */
function handleAxiosError(error: unknown): never {
  let message = "HTTP error occurred";
  let status: number | undefined;

  if (axios.isAxiosError(error)) {
    status = error.response?.status;
    message = (error.response?.data as { message?: string })?.message ?? error.message;
    logger.error(`HTTP ${status ?? "?"} -`, message);
  } else if (error instanceof Error) {
    message = error.message;
    logger.error("HTTP error -", message);
  }

  throw Object.assign(new Error(message), { status }) as HttpError;
}

/*
 * Server-side Axios client.
 *
 * baseURL is API_URL (process.env.API_URL) - a server-only env var that is
 * never prefixed with NEXT_PUBLIC_ and is therefore never bundled into the
 * browser. Only import `request` from route handlers and other server-only
 * modules. Importing this in browser code will result in API_URL being
 * undefined and all requests failing.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 12000,
});

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const headers = {
    ...(config.data !== undefined ? { "Content-Type": "application/json" } : {}),
    ...config.headers,
  };

  logger.http("→", config.method?.toUpperCase(), config.url);
  try {
    const response = await httpClient.request<T>({ ...config, headers });
    logger.http("✓", config.method?.toUpperCase(), config.url, response.status);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

/*
 * Browser-side Axios client.
 *
 * No baseURL - paths resolve relative to the current page origin, so
 * `/api/auth/login` always hits the Next.js route handler regardless of
 * environment. Use `browserRequest` from client-side utils that need to
 * call Next.js API routes. Never use this in route handlers or any
 * server-only module.
 */
export const browserClient: AxiosInstance = axios.create({
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

export async function browserRequest<T>(config: AxiosRequestConfig): Promise<T> {
  logger.http("→", config.method?.toUpperCase(), config.url);
  try {
    const response = await browserClient.request<T>(config);
    logger.http("✓", config.method?.toUpperCase(), config.url, response.status);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}
