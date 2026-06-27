import axios from 'axios';

export function extractApiError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data as {
    message?: string;
    errors?: Record<string, string[]>;
  } | undefined;

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }

  if (data?.message) return data.message;

  return fallback;
}
