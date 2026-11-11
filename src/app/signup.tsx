"use client";

import { useState } from "react";

type Greeting = { message: string; at: string };

export default function Signup() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  return (
    <form
      className="flex w-full flex-col gap-3 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        const response = await fetch(
          `/api/greeting?name=${encodeURIComponent(name)}`,
        );
        setGreeting(await response.json());
      }}
    >
      <input
        data-testid="name"
        aria-label="Your name"
        placeholder="Your name"
        className="h-12 flex-1 rounded-full border border-black/[.08] px-5"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {greeting !== null && (
        <p data-testid="result" className="self-center text-lg">
          {greeting.message}{" "}
          <span className="text-sm text-zinc-500">
            at {greeting.at.slice(11, 19)}
          </span>
        </p>
      )}
    </form>
  );
}
