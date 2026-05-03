import { useCallback, useRef, useState } from "react";
import { Upload, Sparkles, Copy, Check, X, Wand2, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STYLES = [
  { id: "midjourney", label: "Midjourney", desc: "Tags + parameters" },
  { id: "stable_diffusion", label: "Stable Diffusion", desc: "Weighted tags" },
  { id: "dalle", label: "DALL·E 3", desc: "Natural language" },
  { id: "photorealistic", label: "Photorealistic", desc: "Camera + lighting" },
  { id: "artistic", label: "Artistic", desc: "Fine art reference" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

export function ImageToPromptStudio() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [style, setStyle] = useState<StyleId>("midjourney");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setImageName(file.name);
      setPrompt("");
    };
    reader.readAsDataURL(file);
  }, []);

  const generate = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setPrompt("");
    try {
      const { data, error } = await supabase.functions.invoke("image-to-prompt", {
        body: { imageUrl, style },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPrompt(data.prompt);
      toast.success("Prompt generated");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate prompt");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImageUrl(null);
    setImageName("");
    setPrompt("");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 w-full">
      {/* Upload / Preview Panel */}
      <div className="glass glow-border rounded-2xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Source Image
            </span>
          </div>
          {imageUrl && (
            <button
              onClick={reset}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!imageUrl ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            className={`group relative flex flex-col items-center justify-center min-h-[420px] rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse-glow" />
              <div className="relative h-20 w-20 rounded-2xl glass glow-border flex items-center justify-center animate-float">
                <Upload className="h-9 w-9 text-primary" />
              </div>
            </div>
            <p className="mt-6 font-display text-lg">
              Drop an image or <span className="text-gradient font-semibold">click to upload</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground font-mono">
              PNG · JPG · WEBP · max 10MB
            </p>
          </label>
        ) : (
          <div className="relative rounded-xl overflow-hidden glow-border">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="w-full h-auto max-h-[480px] object-contain bg-black/40"
            />
            {loading && (
              <>
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan shadow-glow" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="font-mono text-xs uppercase tracking-widest text-primary">
                    Analyzing pixels…
                  </p>
                </div>
              </>
            )}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs font-mono text-muted-foreground truncate">{imageName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="glass glow-border rounded-2xl p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Prompt Style
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`relative px-3 py-2.5 rounded-lg text-left transition-all ${
                style === s.id
                  ? "bg-primary/15 border border-primary/50 shadow-glow"
                  : "border border-border hover:border-primary/30 hover:bg-card/50"
              }`}
            >
              <div className={`text-sm font-semibold ${style === s.id ? "text-primary" : ""}`}>
                {s.label}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">
                {s.desc}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={!imageUrl || loading}
          className="group relative w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow hover:shadow-glow-strong transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="h-5 w-5" />
            )}
            {loading ? "Generating…" : "Generate Prompt"}
          </span>
        </button>

        <div className="mt-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Output
            </span>
            {prompt && (
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary hover:text-accent transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
          <div className="flex-1 min-h-[200px] rounded-xl bg-black/30 border border-border p-4 font-mono text-sm leading-relaxed overflow-auto">
            {prompt ? (
              <p className="whitespace-pre-wrap text-foreground/90">{prompt}</p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/60">
                <ImageIcon className="h-8 w-8 mb-2" />
                <p className="text-xs">
                  Your generated prompt will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
