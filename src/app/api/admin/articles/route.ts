import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import { getArticleBySlug, getAllArticles, getArticleSlugs } from "@/lib/articles";

const articlesDirectory = path.join(process.cwd(), "content/articles");

function ensureDirectoryExists() {
  if (!fs.existsSync(articlesDirectory)) {
    fs.mkdirSync(articlesDirectory, { recursive: true });
  }
}

export async function GET() {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return all articles including unpublished ones for admin
  const slugs = getArticleSlugs();
  const articles = slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article) => article !== null)
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

  return NextResponse.json(articles);
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

    ensureDirectoryExists();

    const filePath = path.join(articlesDirectory, `${slug}.md`);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const date = new Date().toISOString().split("T")[0];

    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${date}"`,
      `excerpt: "${(excerpt || "").replace(/"/g, '\\"')}"`,
      image ? `image: "${image}"` : null,
      `published: ${published !== false}`,
      "---",
      "",
      content,
    ]
      .filter((line) => line !== null)
      .join("\n");

    fs.writeFileSync(filePath, frontmatter, "utf8");

    return NextResponse.json({ success: true, slug });
  } catch {
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

    ensureDirectoryExists();

    const originalFilePath = path.join(articlesDirectory, `${originalSlug}.md`);
    const newFilePath = path.join(articlesDirectory, `${slug}.md`);

    if (!fs.existsSync(originalFilePath)) {
      return NextResponse.json(
        { error: "Original article not found" },
        { status: 404 }
      );
    }

    // If slug changed, check new slug doesn't exist
    if (originalSlug !== slug && fs.existsSync(newFilePath)) {
      return NextResponse.json(
        { error: "An article with this slug already exists" },
        { status: 409 }
      );
    }

    const articleDate = date || new Date().toISOString().split("T")[0];

    const frontmatter = [
      "---",
      `title: "${title.replace(/"/g, '\\"')}"`,
      `date: "${articleDate}"`,
      `excerpt: "${(excerpt || "").replace(/"/g, '\\"')}"`,
      image ? `image: "${image}"` : null,
      `published: ${published !== false}`,
      "---",
      "",
      content,
    ]
      .filter((line) => line !== null)
      .join("\n");

    // Delete original file if slug changed
    if (originalSlug !== slug) {
      fs.unlinkSync(originalFilePath);
    }

    fs.writeFileSync(newFilePath, frontmatter, "utf8");

    return NextResponse.json({ success: true, slug });
  } catch {
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

    const filePath = path.join(articlesDirectory, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 }
    );
  }
}
