export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center gap-10 p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Dobra
          </h1>
          <p className="text-lg text-gray-500">
            Brand style consistency platform
          </p>
        </div>

        {/* Card demo */}
        <div className="card px-8 py-6 max-w-md w-full">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Phase 1: Foundation
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Stores, mock AI, rate limiting, and design system configured.
          </p>

          {/* Color palette */}
          <div className="flex gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-primary-500" title="Primary 500" />
            <div className="w-8 h-8 rounded-md bg-primary-600" title="Primary 600" />
            <div className="w-8 h-8 rounded-md bg-primary-700" title="Primary 700" />
            <div className="w-8 h-8 rounded-md bg-gray-900" title="Gray 900" />
            <div className="w-8 h-8 rounded-md bg-gray-500" title="Gray 500" />
            <div className="w-8 h-8 rounded-md bg-success-500" title="Success" />
            <div className="w-8 h-8 rounded-md bg-warning-500" title="Warning" />
            <div className="w-8 h-8 rounded-md bg-error-500" title="Error" />
          </div>

          {/* Button demos */}
          <div className="flex gap-3 mb-4">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-ghost">Ghost</button>
          </div>

          {/* Input demo */}
          <input
            className="input mb-4"
            placeholder="Design system input..."
            readOnly
          />

          {/* Text gradient demo */}
          <p className="text-gradient font-semibold text-sm">
            AI-powered brand consistency
          </p>
        </div>

        {/* Status badges */}
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-success-50 px-3 py-1 text-xs font-medium text-success-700">
            <span className="spinner !w-3 !h-3 !border-success-600 !border-t-success-200" />
            Mock AI Active
          </span>
          <span className="inline-flex items-center rounded-md bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
            Rate Limited
          </span>
        </div>
      </main>
    </div>
  );
}
