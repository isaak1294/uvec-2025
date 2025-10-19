"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "github-markdown-css/github-markdown.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const page = () => {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/Documentation/Colors and Styles.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <article className="markdown-body" style={{ padding: 20 }}>
      <Link href="/">
        <button className="flex gap-2">
          <ArrowLeft /> Go Back
        </button>
      </Link>
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </article>
  );
};

export default page;
