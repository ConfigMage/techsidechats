import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getArticleSlugsAsync,
  getArticleBySlugAsync,
  saveArticle,
  deleteArticle,
  articleExists,
} from "@/lib/articles";

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const slugs = await getArticleSlugsAsync();
    const articles = [];

    for (const slug of slugs) {
      const article = await getArticleBySlugAsync(slug);
      if (article && !article.deleted) {
        articles.push(article);
      }
    }

    articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, excerpt, image, content, published } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: "Slug must be lowercase with hyphens only" },
        { status: 400 }
      );
    }

    // Check if article already exists
    const exists = await articleExists(slug);
    if (exists) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const date = new Date().toISOString().split("T")[0];

    await saveArticle(slug, {
      title,
      date,
      excerpt: excerpt || "",
      image: image || undefined,
      published: published !== false,
      content,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { originalSlug, title, slug, excerpt, image, content, published, date } =
      await request.json();

    if (!originalSlug || !title || !slug || !content) {
      return NextResponse.json(
        { error: "Original slug, title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Check if original article exists
    const originalExists = await articleExists(originalSlug);
    if (!originalExists) {
      return NextResponse.json(
        { error: "Original article not found" },
        { status: 404 }
      );
    }

    // If slug changed, check new slug doesn't exist
    if (originalSlug !== slug) {
      const newExists = await articleExists(slug);
      if (newExists) {
        return NextResponse.json(
          { error: "An article with this slug already exists" },
          { status: 409 }
        );
      }
      // Delete the old article
      await deleteArticle(originalSlug);
    }

    const articleDate = date || new Date().toISOString().split("T")[0];

    await saveArticle(slug, {
      title,
      date: articleDate,
      excerpt: excerpt || "",
      image: image || undefined,
      published: published !== false,
      content,
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Failed to update article" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const exists = await articleExists(slug);
    if (!exists) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    await deleteArticle(slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
