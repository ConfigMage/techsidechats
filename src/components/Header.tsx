"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream-50/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-cream-200 dark:border-dark-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="group">
          <h1 className="text-xl sm:text-2xl font-semibold text-charcoal dark:text-dark-text">
            Techside{" "}
            <span className="text-amber-accent group-hover:text-amber-dark transition-colors">
              Chats
            </span>
          </h1>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
