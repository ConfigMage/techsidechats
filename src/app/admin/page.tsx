"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Article {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  published: boolean;
  content: string;
  readingTime: number;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPublished, setFormPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/articles");
      if (res.ok) {
        setIsAuthenticated(true);
        const data = await res.json();
        setArticles(data);
      }
    } catch {
      // Not authenticated
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword("");
        checkAuth();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("An error occurred");
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
    setArticles([]);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const resetForm = () => {
    setFormTitle("");
    setFormSlug("");
    setFormExcerpt("");
    setFormImage("");
    setFormContent("");
    setFormPublished(true);
    setEditingArticle(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (article: Article) => {
    setFormTitle(article.title);
    setFormSlug(article.slug);
    setFormExcerpt(article.excerpt);
    setFormImage(article.image || "");
    setFormContent(article.content);
    setFormPublished(article.published);
    setEditingArticle(article);
    setIsCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const method = editingArticle ? "PUT" : "POST";
      const body = editingArticle
        ? {
            originalSlug: editingArticle.slug,
            title: formTitle,
            slug: formSlug,
            excerpt: formExcerpt,
            image: formImage || undefined,
            content: formContent,
            published: formPublished,
            date: editingArticle.date,
          }
        : {
            title: formTitle,
            slug: formSlug,
            excerpt: formExcerpt,
            image: formImage || undefined,
            content: formContent,
            published: formPublished,
          };

      const res = await fetch("/api/admin/articles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        resetForm();
        checkAuth();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save article");
      }
    } catch {
      setError("An error occurred");
    }
    setIsSaving(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const res = await fetch("/api/admin/articles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (res.ok) {
        checkAuth();
        if (editingArticle?.slug === slug) {
          resetForm();
        }
      }
    } catch {
      setError("Failed to delete article");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-warmgray">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-charcoal dark:text-dark-text mb-6 text-center">
            Admin Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-amber-accent text-white rounded-lg hover:bg-amber-dark transition-colors font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-charcoal dark:text-dark-text">
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-warmgray hover:text-charcoal dark:hover:text-dark-text transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Articles List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-charcoal dark:text-dark-text">
              Articles
            </h2>
            <button
              onClick={startCreating}
              className="px-4 py-2 bg-amber-accent text-white rounded-lg hover:bg-amber-dark transition-colors text-sm font-medium"
            >
              New Article
            </button>
          </div>
          <div className="space-y-3">
            {articles.length === 0 ? (
              <p className="text-warmgray py-8 text-center">No articles yet</p>
            ) : (
              articles.map((article) => (
                <div
                  key={article.slug}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    editingArticle?.slug === article.slug
                      ? "border-amber-accent bg-amber-accent/5"
                      : "border-cream-200 dark:border-charcoal-light hover:border-amber-accent/50"
                  }`}
                  onClick={() => startEditing(article)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-charcoal dark:text-dark-text truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-warmgray mt-1">
                        {article.date} • {article.readingTime} min read
                        {!article.published && (
                          <span className="ml-2 text-amber-dark">(Draft)</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.slug);
                      }}
                      className="text-warmgray hover:text-red-500 transition-colors p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          {(isCreating || editingArticle) && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-charcoal dark:text-dark-text">
                  {editingArticle ? "Edit Article" : "New Article"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-warmgray hover:text-charcoal dark:hover:text-dark-text transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-warmgray-dark dark:text-warmgray-light mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (!editingArticle) {
                      setFormSlug(generateSlug(e.target.value));
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-dark dark:text-warmgray-light mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent font-mono text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-dark dark:text-warmgray-light mb-1">
                  Excerpt
                </label>
                <textarea
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent resize-none"
                  placeholder="Brief description of the article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-dark dark:text-warmgray-light mb-1">
                  Featured Image URL (optional)
                </label>
                <input
                  type="text"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent"
                  placeholder="/images/my-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warmgray-dark dark:text-warmgray-light mb-1">
                  Content (Markdown)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={16}
                    className="w-full px-4 py-3 rounded-lg border border-cream-200 dark:border-charcoal-light bg-white dark:bg-dark-surface text-charcoal dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-amber-accent font-mono text-sm resize-none"
                    placeholder="Write your article in Markdown..."
                    required
                  />
                  <div className="hidden md:block p-4 rounded-lg border border-cream-200 dark:border-charcoal-light bg-cream-50 dark:bg-dark-surface overflow-auto max-h-96">
                    <p className="text-xs text-warmgray mb-2">Preview</p>
                    <div
                      className="article-content text-sm"
                      dangerouslySetInnerHTML={{
                        __html: formContent
                          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/`(.*?)`/g, '<code>$1</code>')
                          .replace(/\n/g, '<br>'),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="rounded border-cream-200 dark:border-charcoal-light text-amber-accent focus:ring-amber-accent"
                />
                <label
                  htmlFor="published"
                  className="text-sm text-warmgray-dark dark:text-warmgray-light"
                >
                  Published
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-amber-accent text-white rounded-lg hover:bg-amber-dark transition-colors font-medium disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingArticle ? "Update Article" : "Create Article"}
              </button>
            </form>
          )}

          {!isCreating && !editingArticle && (
            <div className="flex items-center justify-center h-64 text-warmgray">
              Select an article to edit or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
