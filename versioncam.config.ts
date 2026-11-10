import type { BrowserContext, Page, Request } from "playwright";
import { defineRecorder } from "versioncam";

const bypassed = new WeakSet<BrowserContext>();

// The spike's second question: which requests never finish after the
// cookie route (the first run waited out every settle on "requests(2)").
// Each is named by host and path only: a query may hold the secret.
const open = new Map<Request, string>();
const where = (url: string) => {
  const u = new URL(url);
  return `${u.origin}${u.pathname}`;
};
function frameOf(r: Request, page: Page) {
  try {
    return r.frame() === page.mainFrame() ? "main" : "other";
  } catch {
    return "none";
  }
}
function watch(page: Page) {
  page.on("request", (r) => open.set(r, `${r.method()} ${r.resourceType()} ${where(r.url())} (frame ${frameOf(r, page)})`));
  page.on("requestfinished", (r) => open.delete(r));
  page.on("requestfailed", (r) => open.delete(r));
  page.on("close", () => console.log(`spike: still open when the page closed: ${[...open.values()].join("; ") || "none"}`));
}
async function report(page: Page, when: string) {
  const ua = await page.evaluate(() => navigator.userAgent);
  const toolbar = await page.locator("vercel-live-feedback").count();
  const scripts = await page.evaluate(() =>
    [...document.scripts].map((s) => s.src).filter((src) => src && !src.includes("/_next/static/")),
  );
  console.log(`spike: ${when}: user agent ${ua}`);
  console.log(`spike: ${when}: toolbar elements ${toolbar}, other scripts ${scripts.map(where).join(", ") || "none"}`);
  console.log(`spike: ${when}: still open: ${[...open.values()].join("; ") || "none"}`);
  setTimeout(() => console.log(`spike: ${when} + 10 s: still open: ${[...open.values()].join("; ") || "none"}`), 10_000);
}

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
        watch(page);
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
      await report(page, "signed in");
    },
  },
});
