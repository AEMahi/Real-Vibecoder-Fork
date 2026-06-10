import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import Editor from "@monaco-editor/react";
function Dashboard() {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [code, setCode] = useState(`// Selected Engine: ${selectedModel}
function init() {
  console.log("Hello from your sandbox workspace!");
}`);
  const [systemPrompt, setSystemPrompt] = useState("You are an expert full-stack developer assistant.");
  const handleModelChange = (model) => {
    setSelectedModel(model);
    setCode((prev) => `// Switched engine context to: ${model}
` + prev.replace(/\/\/ Selected Engine: .*\n|\/\/ Switched engine context to: .*\n/, ""));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex h-14 items-center justify-between border-b bg-card px-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 font-semibold", children: /* @__PURE__ */ jsx("span", { className: "text-primary text-lg", children: "⚙️ Multi-AI Sandbox Dev Environment" }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "model-select", className: "text-sm font-medium text-muted-foreground", children: "Active Provider Engine:" }),
        /* @__PURE__ */ jsxs("select", { id: "model-select", value: selectedModel, onChange: (e) => handleModelChange(e.target.value), className: "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring", children: [
          /* @__PURE__ */ jsxs("optgroup", { label: "Google Gemini (Native SDK)", children: [
            /* @__PURE__ */ jsx("option", { value: "gemini-2.5-flash", children: "Gemini 2.5 Flash" }),
            /* @__PURE__ */ jsx("option", { value: "gemini-2.5-pro", children: "Gemini 2.5 Pro" })
          ] }),
          /* @__PURE__ */ jsx("optgroup", { label: "OpenAI API Integration", children: /* @__PURE__ */ jsx("option", { value: "gpt-4o", children: "GPT-4o Engine" }) }),
          /* @__PURE__ */ jsx("optgroup", { label: "Anthropic Models", children: /* @__PURE__ */ jsx("option", { value: "claude-3.7-sonnet", children: "Claude 3.7 Sonnet" }) }),
          /* @__PURE__ */ jsx("optgroup", { label: "Offline Edge Runtimes", children: /* @__PURE__ */ jsx("option", { value: "local-llama", children: "Local Llama 3 (Sandbox Execution)" }) })
        ] }),
        /* @__PURE__ */ jsx("button", { className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90", children: "Generate Code" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-80 border-r bg-muted/30 p-4 flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium mb-1.5", children: "System Context Configuration" }),
          /* @__PURE__ */ jsx("textarea", { value: systemPrompt, onChange: (e) => setSystemPrompt(e.target.value), className: "w-full h-32 rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border bg-card p-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold block text-card-foreground mb-1", children: "Engine Metadata:" }),
          "Target compilation running on Vite 7 with automated cloud deployments via Nitro Edge engine workers."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col bg-background", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b px-4 py-2 bg-muted/20", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-mono font-medium text-muted-foreground", children: "Workspace Source Code" }),
          /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-400", children: selectedModel.includes("gemini") ? "Native Direct Hook" : "Proxy Framework" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(Editor, { height: "100%", defaultLanguage: "typescript", theme: "vs-dark", value: code, onChange: (value) => setCode(value || ""), options: {
          minimap: {
            enabled: false
          },
          fontSize: 14,
          automaticLayout: true
        } }) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
