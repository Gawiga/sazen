import PocketBase from "pocketbase";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

/**
 * Creates and returns a PocketBase instance
 * In SSR, each request gets its own instance to avoid shared state issues
 */
export function getPocketBaseClient(): PocketBase {
  const pb = new PocketBase(POCKETBASE_URL);

  // Restore auth state from stored token if available
  if (typeof window !== "undefined") {
    const storage = globalThis.localStorage as
      | Pick<Storage, "getItem">
      | undefined;
    const storedAuth =
      storage && typeof storage.getItem === "function"
        ? storage.getItem("pb_auth")
        : null;
    if (storedAuth) {
      try {
        pb.authStore.save(
          JSON.parse(storedAuth).token,
          JSON.parse(storedAuth).record,
        );
      } catch (error) {
        console.warn("Failed to restore auth state:", error);
      }
    }
  }

  return pb;
}

/**
 * Client instance for use in browser context
 */
export const pbClient =
  typeof window !== "undefined" ? getPocketBaseClient() : null;

export default getPocketBaseClient;
