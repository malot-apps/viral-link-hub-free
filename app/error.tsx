'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0d13] text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-400 mb-6 text-sm">{error?.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-red-700 transition"
      >
        Try Again
      </button>
    </div>
  );
}
