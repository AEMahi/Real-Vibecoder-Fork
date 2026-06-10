import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ProjectShell } from "@/components/vibe/ProjectShell";
import { getProject, loadProjects, upsertProject } from "@/lib/vibe/storage";
import type { Project } from "@/lib/vibe/types";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/")({
  component: Home,
});

function createDefaultProject(): Project {
  return {
    id: nanoid(8),
    name: "VibeCoder Project",
    files: {},
    messages: [],
    checkpoints: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function Home() {
  const [project, setProject] = useState<Project | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = loadProjects()[0];
    const currentProject = existing ?? createDefaultProject();
    if (!existing) {
      upsertProject(currentProject);
    }
    setProject(currentProject);
    setLoaded(true);
  }, []);

  function update(next: Project) {
    setProject(next);
    upsertProject(next);
  }

  if (!loaded) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <Toaster richColors position="top-right" />
      {project ? <ProjectShell project={project} onChange={update} /> : null}
    </>
  );
}
