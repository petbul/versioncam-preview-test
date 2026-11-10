import { defineRecorder } from "versioncam";

export default defineRecorder({
  // CI sets VERSIONCAM_BASE_URL to the commit's own deployment. There is no
  // webServer: the app is never started here, only opened where it runs.
  baseUrl: process.env.VERSIONCAM_BASE_URL ?? "http://localhost:3000",
  // Vercel's Deployment Protection lets these through; only the app's own
  // requests carry them. Empty on a laptop without the secret.
  headers: {
    "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  },
  viewport: { width: 1440, height: 900 },
  clips: "demos/clips/**/*.clip.ts",
  // The greeting carries the server's time, so it is answered from the file
  // recorded on localhost, on every preview and on production alike.
  replay: { record: ["**/api/greeting*"] },
  auth: {
    // Called after every open. It signs in only when the app sent the
    // browser to its sign-in page, with the test account from secrets.
    login: async (page) => {
      if (!new URL(page.url()).pathname.startsWith("/login")) return;
      const user = process.env.RECORDING_USER;
      const pass = process.env.RECORDING_PASS;
      if (!user || !pass) {
        throw new Error("Set RECORDING_USER and RECORDING_PASS to sign in.");
      }
      await page.getByTestId("email").fill(user);
      await page.getByTestId("password").fill(pass);
      await page.getByTestId("sign-in").click();
      await page.waitForURL((url) => !url.pathname.startsWith("/login"));
    },
  },
});
