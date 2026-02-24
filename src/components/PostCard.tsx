import { Link } from "react-router-dom";
import { Calendar, Clock, Tag } from "lucide-react";
import type { Post } from "@/lib/posts";
import { motion } from "framer-motion";

interface PostCardProps {
  post: Post;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const { frontmatter, slug, readingTime, type } = post;
  const date = new Date(frontmatter.published).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Link
        to={`/posts/${slug}`}
        className="group block glass-panel rounded-2xl overflow-hidden hover:glow-cyan transition-all duration-300 hover:border-primary/30"
      >
        {/* Cover image area */}
        <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <span className="text-4xl font-bold text-primary/20 font-mono select-none">
            {type === "writeup" ? ">" : "#"}_
          </span>
          {/* Category badge */}
          <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {frontmatter.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {frontmatter.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {frontmatter.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readingTime} min
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-tag-bg text-tag-fg"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {frontmatter.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{frontmatter.tags.length - 3}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
