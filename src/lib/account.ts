/**
 * The one test account this app knows.
 *
 * This repository exists to test recording a deployed preview that needs a
 * sign-in, so the account is as small as a sign-in can be: one email and
 * the SHA-256 of its password. The password itself is only in the
 * repository's Actions secrets (`RECORDING_PASS`), which is where a real
 * app's test account would keep it too.
 */
export const TEST_USER = "demo@example.com";
export const TEST_PASSWORD_SHA256 =
  "8a50764ca30f78f88eab6ce007bf59ce81af08125cd53e32b1c29aaa608c1e2e";

/**
 * What the session cookie holds once someone has signed in. A constant,
 * because nothing behind this sign-in is worth protecting: it is here so
 * the recording has a real form to fill in and a real redirect to follow.
 */
export const SESSION_COOKIE = "session";
export const SESSION_VALUE = "signed-in";
