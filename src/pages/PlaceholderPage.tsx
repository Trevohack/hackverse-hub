import Layout from "@/components/Layout";
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 text-center">
        <Construction className="w-12 h-12 text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">{description}</p>
        <Link
          to="/"
          className="text-primary hover:underline text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </Layout>
  );
}
