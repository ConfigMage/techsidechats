"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group">
            <span className="text-xl font-semibold tracking-tight text-gray-900 dark:text-dark-text">
              Techside Chats
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
