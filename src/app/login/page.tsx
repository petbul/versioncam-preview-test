export default function Login() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 font-sans">
      <form
        method="post"
        action="/api/login"
        className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <input
          data-testid="email"
          name="email"
          type="email"
          aria-label="Email"
          placeholder="Email"
          className="h-12 rounded-full border border-black/[.08] px-5"
        />
        <input
          data-testid="password"
          name="password"
          type="password"
          aria-label="Password"
          placeholder="Password"
          className="h-12 rounded-full border border-black/[.08] px-5"
        />
        <button
          data-testid="sign-in"
          type="submit"
          className="h-12 rounded-full bg-foreground px-5 text-background"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
