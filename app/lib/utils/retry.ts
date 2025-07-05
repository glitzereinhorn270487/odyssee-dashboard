export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && err.message?.includes("429")) {
      console.warn(`[Retry] 429 erhalten. Neuer Versuch in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}
