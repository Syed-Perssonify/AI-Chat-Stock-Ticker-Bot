"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words overflow-wrap-anywhere">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");

            return !inline && match ? (
              <CodeBlock language={match[1]} code={codeContent} />
            ) : (
              <code
                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono break-words"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }: any) => (
            <p className="break-words overflow-wrap-anywhere">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
