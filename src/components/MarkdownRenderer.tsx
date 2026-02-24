import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && typeof children === "string" && !children.includes("\n");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  if (isInline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="relative group">
      {match && (
        <span className="absolute top-2 left-4 text-xs font-mono text-muted-foreground/60">
          {match[1]}
        </span>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/50 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <code className={className} {...props}>
        {children}
      </code>
    </div>
  );
}

// Callout detection: blockquotes starting with **Info:**, **Warning:**, **Tip:**, **Danger:**
function BlockquoteRenderer({ children }: any) {
  const text = String(
    children?.props?.children || children
  );

  let type = "info";
  if (text.includes("Warning:")) type = "warning";
  else if (text.includes("Danger:")) type = "danger";
  else if (text.includes("Tip:")) type = "tip";

  return (
    <blockquote className={`callout callout-${type}`}>
      {children}
    </blockquote>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-hackverse">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          code: CodeBlock,
          blockquote: BlockquoteRenderer,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
