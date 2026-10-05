'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0d13] text-white min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Application Error</h2>
        <p className="text-gray-400 mb-6 text-sm">{error?.message || 'An unexpected system error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
