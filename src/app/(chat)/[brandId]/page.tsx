/**
 * Brand-specific chat page
 *
 * Dynamic route for individual brand conversations.
 * This will be connected to useChat in Plan 02.
 */
export default async function BrandChatPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = await params;

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-2xl px-4 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">
          Chat for {brandId}
        </h2>
        <p className="text-gray-500">
          Chat interface will be connected in Plan 02.
        </p>
      </div>
    </div>
  );
}
