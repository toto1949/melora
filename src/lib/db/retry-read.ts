import { logEvent } from "@/lib/observability/logger";

// Only use for reads: retrying a write could duplicate its effects.
export async function retryDatabaseRead<T extends { error: unknown; status: number }>(
  operation: string,
  read: () => PromiseLike<T>,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    const result = await read();
    if (!result.error || ![502, 503, 504].includes(result.status) || attempt >= 3) {
      return result;
    }
    logEvent("warn", "database_read_retry", { operation, attempt, status: result.status });
    await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** (attempt - 1)));
  }
}
