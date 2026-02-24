import { Terminal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Hack<span className="text-gradient-cyan">verse</span>
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/writeups" className="hover:text-foreground transition-colors">Writeups</Link>
            <Link to="/tools" className="hover:text-foreground transition-colors">Tools</Link>
            <Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link>
            <Link to="/community" className="hover:text-foreground transition-colors">Community</Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Hackverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
