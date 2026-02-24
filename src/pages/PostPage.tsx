import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import TableOfContents from "@/components/TableOfContents";
import { getPostBySlug, getAdjacentPosts } from "@/lib/posts";
import { Calendar, Clock, Tag, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PostPage() {
  const params = useParams();
  const slug = params["*"] || "";
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist.</p>
          <Link to="/writeups" className="text-primary hover:underline">
            ← Back to Writeups
          </Link>
        </div>
      </Layout>
    );
  }

  const { prev, next } = getAdjacentPosts(slug);
  const date = new Date(post.frontmatter.published).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          to="/writeups"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Writeups
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <header className="mb-10 max-w-3xl">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              {post.frontmatter.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
              {post.frontmatter.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {post.frontmatter.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.frontmatter.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/writeups?tag=${tag}`}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-tag-bg text-tag-fg hover:opacity-80 transition-opacity"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </Link>
              ))}
            </div>
          </header>

          {/* Content + TOC */}
          <div className="flex gap-10">
            <div className="flex-1 min-w-0 max-w-3xl">
              <MarkdownRenderer content={post.content} />
            </div>
            <aside className="hidden xl:block w-64 shrink-0">
              <TableOfContents content={post.content} />
            </aside>
          </div>

          {/* Prev/Next */}
          <nav className="mt-16 pt-8 border-t border-border flex justify-between gap-4 max-w-3xl">
            {prev ? (
              <Link
                to={`/posts/${prev.slug}`}
                className="group flex-1 glass-panel rounded-xl p-4 hover:border-primary/30 transition-all"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                  <ChevronLeft className="w-3 h-3" /> Previous
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {prev.frontmatter.title}
                </span>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to={`/posts/${next.slug}`}
                className="group flex-1 glass-panel rounded-xl p-4 text-right hover:border-primary/30 transition-all"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-1">
                  Next <ChevronRight className="w-3 h-3" />
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {next.frontmatter.title}
                </span>
              </Link>
            ) : <div />}
          </nav>
        </motion.div>
      </article>
    </Layout>
  );
}
