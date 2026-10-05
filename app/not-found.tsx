import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0d13] text-white p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-[#e50914] text-white rounded-lg font-semibold hover:bg-red-700 transition">
        Return Home
      </Link>
    </div>
  );
}
