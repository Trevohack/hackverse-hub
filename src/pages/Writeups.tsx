import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { posts, getAllTags, getAllCategories } from "@/lib/posts";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";

type SortOption = "latest" | "oldest" | "title";

export default function Writeups() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get("tag") || "";

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "writeup" | "blog">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTag ? [initialTag] : []);
  const [sort, setSort] = useState<SortOption>("latest");
  const [showFilters, setShowFilters] = useState(false);

  const allTags = getAllTags();
  const allCategories = getAllCategories();

  const filtered = useMemo(() => {
    let result = [...posts];

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        selectedTags.some((t) => p.frontmatter.tags.includes(t))
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.frontmatter.title.toLowerCase().includes(q) ||
          p.frontmatter.description.toLowerCase().includes(q) ||
          p.frontmatter.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "latest")
        return new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime();
      if (sort === "oldest")
        return new Date(a.frontmatter.published).getTime() - new Date(b.frontmatter.published).getTime();
      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });

    return result;
  }, [search, typeFilter, selectedTags, sort]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSelectedTags([]);
    setSort("latest");
  };

  const hasActiveFilters = search || typeFilter !== "all" || selectedTags.length > 0 || sort !== "latest";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
            Writeups & Blogs
          </h1>
          <p className="text-muted-foreground">
            {filtered.length} post{filtered.length !== 1 ? "s" : ""} found
          </p>
        </motion.div>

        {/* Search + filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="glass-panel rounded-xl p-5 mb-6 space-y-4"
          >
            {/* Type */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Type
              </label>
              <div className="flex gap-2">
                {(["all", "writeup", "blog"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      typeFilter === t
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "all" ? "All" : t === "writeup" ? "Writeups" : "Blogs"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedTags.includes(tag)
                        ? "bg-tag-bg text-tag-fg ring-1 ring-primary/30"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                Sort
              </label>
              <div className="flex gap-2">
                {([
                  ["latest", "Latest"],
                  ["oldest", "Oldest"],
                  ["title", "Title"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSort(value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sort === value
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {/* Posts grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No posts found matching your criteria.</p>
            <button onClick={clearFilters} className="text-primary mt-2 hover:underline text-sm">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
