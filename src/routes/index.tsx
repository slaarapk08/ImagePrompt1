import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Zap, Image as ImageIcon, Wand2 } from "lucide-react";
import { ImageToPromptStudio } from "@/components/ImageToPromptStudio";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Image to Prompt — AI Reverse Prompt Engineering" },
      {
        name: "description",
        content:
          "Upload any image and instantly get a perfectly crafted prompt for Midjourney, Stable Diffusion, DALL·E, and more. Powered by AI vision.",
      },
      { property: "og:title", content: "Image to Prompt — AI Reverse Prompt Engineering" },
      {
        property: "og:description",
        content: "Turn any image into a perfect AI generation prompt in seconds.",
      },
    ],
  }),
});

function Index() {
  return (
    <main className="relative min-h-screen bg-hero overflow-hidden">
      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px]" />

      {/* Nav */}
      <header className="relative z-10 px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
            <Wand2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            prompt<span className="text-gradient">.lab</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            AI Vision Online
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-12 pb-10 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Reverse prompt engineering
          </span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95]">
          Any image into the
          <br />
          <span className="text-gradient">perfect prompt</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Upload a picture. Pick your model. Get a meticulously crafted prompt
          tuned for Midjourney, Stable Diffusion, DALL·E, and more.
        </p>
      </section>

      {/* Studio */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-12 pb-16 max-w-7xl mx-auto">
        <ImageToPromptStudio />
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "Instant analysis",
              desc: "Vision AI extracts subject, lighting, composition, and mood in seconds.",
            },
            {
              icon: Wand2,
              title: "5 prompt styles",
              desc: "Optimized formats for Midjourney, SD, DALL·E, photoreal, and fine art.",
            },
            {
              icon: ImageIcon,
              title: "Pixel-faithful",
              desc: "Captures details a human would miss — lens, era, palette, brushwork.",
            },
          ].map((f) => (
            <div key={f.title} className="glass rounded-xl p-5 hover:shadow-glow transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-6 lg:px-12 py-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Built with Lovable AI · Vision powered
        </p>
      </footer>
    </main>
  );
}
