"use client";

import { useState, useEffect, useCallback } from "react";

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

  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPublished, setFormPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Debounced preview generation
  const generatePreview = useCallback(async (content: string) => {
    if (!content.trim()) {
      setPreviewHtml("");
      return;
    }

    setIsLoadingPreview(true);
    try {
      const res = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      }
    } catch {
      // Silently fail preview
    }
    setIsLoadingPreview(false);
  }, []);

  // Update preview when content changes and preview is visible
  useEffect(() => {
    if (showPreview) {
      const timer = setTimeout(() => {
        generatePreview(formContent);
      }, 300); // Debounce 300ms
      return () => clearTimeout(timer);
    }
  }, [formContent, showPreview, generatePreview]);

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
    setShowPreview(false);
    setPreviewHtml("");
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
    setShowPreview(false);
    setPreviewHtml("");
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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Articles List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles
            </h2>
            <button
              onClick={startCreating}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              New article
            </button>
          </div>
          <div className="space-y-1">
            {articles.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No articles yet</p>
            ) : (
              articles.map((article) => (
                <div
                  key={article.slug}
                  className={`p-4 border transition-colors cursor-pointer ${
                    editingArticle?.slug === article.slug
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => startEditing(article)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {article.date}
                        {!article.published && (
                          <span className="ml-2 text-amber-600">(Draft)</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(article.slug);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
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
        <div className="lg:col-span-3">
          {(isCreating || editingArticle) && (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingArticle ? "Edit article" : "New article"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  placeholder="Brief description shown on the home page..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content (Markdown)
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className={`px-3 py-1 text-sm transition-colors ${
                        !showPreview
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPreview(true);
                        generatePreview(formContent);
                      }}
                      className={`px-3 py-1 text-sm transition-colors ${
                        showPreview
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {!showPreview ? (
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={24}
                    className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                    placeholder="Write your article in Markdown...

# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

> Blockquote

`inline code`

[Link text](https://example.com)"
                    required
                  />
                ) : (
                  <div className="w-full min-h-[500px] px-6 py-4 border border-gray-200 bg-white overflow-auto">
                    {isLoadingPreview ? (
                      <div className="flex items-center justify-center h-32 text-gray-400">
                        Loading preview...
                      </div>
                    ) : previewHtml ? (
                      <div className="max-w-2xl mx-auto">
                        <div className="mb-8 pb-6 border-b border-gray-200">
                          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
                            {formTitle || "Untitled"}
                          </h1>
                          <div className="flex items-center gap-3 text-gray-500 text-sm">
                            <span className="font-medium text-gray-900">ConfigMage</span>
                            <span>·</span>
                            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                        </div>
                        <div
                          className="article-content"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-gray-400">
                        Start writing to see preview
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label
                    htmlFor="published"
                    className="text-sm text-gray-700"
                  >
                    Published
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editingArticle ? "Update" : "Publish"}
                </button>
              </div>
            </form>
          )}

          {!isCreating && !editingArticle && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select an article to edit or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
