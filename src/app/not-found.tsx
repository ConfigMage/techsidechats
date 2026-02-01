import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-amber-accent mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-charcoal dark:text-dark-text mb-4">
        Page Not Found
      </h2>
      <p className="text-warmgray dark:text-warmgray-light mb-8 max-w-md">
        Looks like this page wandered off. Let&apos;s get you back to the good stuff.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-amber-accent text-white rounded-lg hover:bg-amber-dark transition-colors font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}
