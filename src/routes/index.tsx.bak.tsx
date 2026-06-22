import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { nanoid } from "nanoid";
import { useState } from "react";
import { TermsModal } from "@/components/TermsModal";

export const Route = createFileRoute("/index/tsx/bak")({
  component: LandingPage,
});

export default function LandingPage() {
  const freshProjectId = nanoid(8);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  function handleAgree() {
    setShowModal(false);
    navigate({ to: "/p/$projectId", params: { projectId: freshProjectId } });
  }

  return (
    <>
      <Toaster richColors position="top-right" />

      {showModal && (
        <TermsModal onAgree={handleAgree} onClose={() => setShowModal(false)} />
      )}

      <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4 text-white">
        <div className="fixed top-6 right-8">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            BlankSheet
          </span>
        </div>
        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-white/10 backdrop-blur-md p-4 shadow-sm border border-white/20">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="mb-4 text-5xl font-extrabold tracking-tight sm:text-6xl text-white">
            Vibe-code with any AI
          </h1>

          <p className="mb-8 text-lg text-white/80 sm:text-xl max-w-2xl mx-auto">
            Your ultimate Multi-AI Sandbox Dev Environment. Bring your own API keys and seamlessly switch between Gemini, Claude, OpenAI, and local models.
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-sm font-bold text-slate-900 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
            >
              Create Workspace <ArrowRight className="ml-2 h-4 w-4 text-slate-900" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
