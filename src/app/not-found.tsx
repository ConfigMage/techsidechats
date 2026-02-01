import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        Page not found
      </h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-gray-900 hover:text-gray-600 underline underline-offset-4 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
