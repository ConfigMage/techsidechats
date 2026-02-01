import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getArticleHtml } from "@/lib/articles";

export async function POST(request: NextRequest) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ html: "" });
    }

    const html = await getArticleHtml(content);
    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
