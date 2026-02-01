"use client";

interface ArticleContentProps {
  html: string;
}

export default function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="article-content animate-fade-in"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
