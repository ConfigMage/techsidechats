import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-16">
          <Link href="/" className="group">
            <span className="text-xl font-semibold tracking-tight text-gray-900">
              Techside Chats
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
