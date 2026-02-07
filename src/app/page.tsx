export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dobra
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Brand style consistency platform
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Phase 1: Foundation &mdash; Setup complete
          </p>
        </div>
      </main>
    </div>
  );
}
