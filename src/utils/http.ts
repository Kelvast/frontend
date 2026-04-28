import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_URL } from "../config/variables";

export interface HttpError extends Error {
  status?: number;
}

/**
 * Create a reusable Axios HTTP client instance.
 * - Sets the base URL from the server-side API_URL environment variable.
 * - Configures request timeout and standard JSON headers.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Makes an HTTP request using the shared Axios client.
 * Handles errors and always returns the data directly.
 *
 * @param config - Axios request config (method, url, data, params, etc).
 * @returns The response data, typed as generic T if provided.
 * @throws An HttpError with `message` and `status` if the request fails.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (error) {
    let message = "HTTP error occurred";
    let status: number | undefined;

    if (axios.isAxiosError(error)) {
      status = error.response?.status;
      message = (error.response?.data as { error?: string })?.error ?? error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    throw Object.assign(new Error(message), { status }) as HttpError;
  }
}
