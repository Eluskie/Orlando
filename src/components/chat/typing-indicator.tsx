/**
 * TypingIndicator - Animated dots showing AI is responding
 *
 * iMessage-style pulsing dots with staggered animation.
 * Uses CSS keyframes for smooth, performant animation.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1.5 rounded-2xl bg-gray-100 px-4 py-3">
        <span
          className="h-2 w-2 rounded-full bg-gray-400"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
          }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: "0.2s",
          }}
        />
        <span
          className="h-2 w-2 rounded-full bg-gray-400"
          style={{
            animation: "typing-dot 1.2s ease-in-out infinite",
            animationDelay: "0.4s",
          }}
        />
      </div>
    </div>
  );
}
