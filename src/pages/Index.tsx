import Layout from "@/components/Layout";
import PostCard from "@/components/PostCard";
import { posts } from "@/lib/posts";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Search, Zap, BookOpen, Shield } from "lucide-react";

const filterChips = ["All", "Writeups", "Blogs", "HTB", "THM", "Web", "Pwn", "Linux", "CTF"];

export default function Home() {
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.frontmatter.published).getTime() - new Date(a.frontmatter.published).getTime()
  );
  const featured = sortedPosts.slice(0, 6);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-sm font-mono text-primary mb-6">
              <Terminal className="w-4 h-4" />
              <span>~/hackverse</span>
              <span className="w-2 h-5 bg-primary animate-cursor-blink" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground mb-6">
              Hack<span className="text-gradient-cyan">verse</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              A cybersecurity community for learners, hackers, and builders. 
              Writeups, tools, and knowledge — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/writeups"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Writeups
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/writeups"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors"
              >
                <Search className="w-4 h-4" />
                Search Posts
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="container mx-auto px-4 -mt-4 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BookOpen, label: "Writeups", value: posts.filter(p => p.type === "writeup").length },
            { icon: Zap, label: "Blog Posts", value: posts.filter(p => p.type === "blog").length },
            { icon: Shield, label: "Categories", value: new Set(posts.map(p => p.frontmatter.category)).size },
            { icon: Terminal, label: "Total Posts", value: posts.length },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter chips */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <Link
              key={chip}
              to={chip === "All" ? "/writeups" : `/writeups?tag=${chip}`}
              className="px-3 py-1.5 rounded-full text-sm font-medium border border-border text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              {chip}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured posts */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">Latest Posts</h2>
          <Link
            to="/writeups"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </div>
      </section>

      {/* Start here CTA */}
      <section className="container mx-auto px-4 mb-16">
        <div className="glass-panel rounded-2xl p-8 md:p-12 text-center glow-cyan">
          <Terminal className="w-8 h-8 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to dive in?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Explore our collection of CTF writeups, security blogs, and learning resources.
          </p>
          <Link
            to="/writeups"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Start Here
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </Layout>
  );
}
