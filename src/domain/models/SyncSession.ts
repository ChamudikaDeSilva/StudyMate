/** A validated session captured for one account's queued changes. */
export interface SyncSession {
  userId: string;
  accessToken: string;
  isCurrent: () => boolean;
}
