import type { BrowserContext } from "playwright";
import { defineRecorder } from "versioncam";

const bypassed = new WeakSet<BrowserContext>();

export default defineRecorder({
  // CI sets VERSIONCAM_BASE_URL to the commit's own deployment. There is no
  // webServer: the app is never started here, only opened where it runs.
  baseUrl: process.env.VERSIONCAM_BASE_URL ?? "http://localhost:3000",
  viewport: { width: 1440, height: 900 },
  clips: "demos/clips/**/*.clip.ts",
  auth: {
    // Called after every open. It signs in only when the app sent the
    // browser to its sign-in page, with the test account from secrets.
    login: async (page) => {
      // A1's cookie route through Vercel's protection: the first time a
      // clip's browser opens the deployment, open it again with the bypass
      // secret, and Vercel sets a cookie for every request after.
      const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      if (bypass && !bypassed.has(page.context())) {
        bypassed.add(page.context());
        const app = new URL(process.env.VERSIONCAM_BASE_URL ?? "http://localhost:3000");
        console.log(`spike: opened ${new URL(page.url()).origin}${new URL(page.url()).pathname} before the bypass`);
        await page.goto(
          `${app.origin}/?x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`,
        );
        const names = (await page.context().cookies()).map((c) => `${c.name}@${c.domain}`);
        console.log(`spike: after the bypass at ${new URL(page.url()).pathname}, cookies ${names.join(", ")}`);
      }
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
