/**
 * Default chat page - shown when no brand is selected
 *
 * Displays centered welcome message guiding user to create a brand.
 * This page will become the brand creation chat in Plan 02.
 */
export default function ChatHomePage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-2xl px-4 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Welcome to Dobra
        </h2>
        <p className="text-gray-500">
          Start by creating a brand or selecting one from the sidebar.
        </p>
      </div>
    </div>
  );
}
