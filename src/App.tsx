import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Writeups from "./pages/Writeups";
import PostPage from "./pages/PostPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/writeups" element={<Writeups />} />
          <Route path="/posts/*" element={<PostPage />} />
          <Route path="/tools" element={<PlaceholderPage title="Tools" description="A curated collection of cybersecurity tools is coming soon." />} />
          <Route path="/resources" element={<PlaceholderPage title="Resources" description="Learning resources and guides are being prepared." />} />
          <Route path="/community" element={<PlaceholderPage title="Community" description="Join our cybersecurity community — coming soon." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
