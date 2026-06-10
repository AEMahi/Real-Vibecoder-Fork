import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useRef, useMemo, Suspense, lazy } from "react";
import { Toaster as Toaster$1, toast } from "sonner";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GripVertical, X, ChevronDown, Check, ChevronUp, KeyRound, CheckCircle2, AlertCircle, Loader2, Trash2, ExternalLink, Plus, Sparkles, ListChecks, Wand2, Clock, Send, Wrench, FolderIcon, FileIcon, ArrowLeft, History, Undo2, Download, Settings } from "lucide-react";
import { Panel, Group, Separator as Separator$1 } from "react-resizable-panels";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { nanoid } from "nanoid";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { R as Route } from "./router-BjmAfoIM.js";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const ResizablePanelGroup = ({ className, ...props }) => /* @__PURE__ */ jsx(
  Group,
  {
    className: cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className),
    ...props
  }
);
const ResizablePanel = Panel;
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  Separator$1,
  {
    className: cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    ),
    ...props,
    children: withHandle && /* @__PURE__ */ jsx("div", { className: "z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border", children: /* @__PURE__ */ jsx(GripVertical, { className: "h-2.5 w-2.5" }) })
  }
);
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    ),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
const PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    defaultBaseURL: "https://generativelanguage.googleapis.com",
    models: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-flash-thinking-exp"
    ],
    envName: "GEMINI_API_KEY",
    kind: "gemini",
    docsUrl: "https://aistudio.google.com/apikey",
    keyHint: "Starts with AIza..."
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    defaultBaseURL: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "o3-mini", "o1"],
    envName: "OPENAI_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://platform.openai.com/api-keys",
    keyHint: "Starts with sk-..."
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    defaultBaseURL: "https://api.anthropic.com/v1",
    models: [
      "claude-sonnet-4-5",
      "claude-opus-4-5",
      "claude-3-5-haiku-latest"
    ],
    envName: "ANTHROPIC_API_KEY",
    kind: "anthropic",
    docsUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "Starts with sk-ant-..."
  },
  {
    id: "lovable",
    name: "Lovable AI Gateway",
    defaultBaseURL: "https://ai.gateway.lovable.dev/v1",
    models: [
      "google/gemini-2.5-flash",
      "google/gemini-2.5-pro",
      "openai/gpt-5",
      "openai/gpt-5-mini"
    ],
    envName: "LOVABLE_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://docs.lovable.dev/features/ai",
    keyHint: "From Lovable workspace"
  },
  {
    id: "xai",
    name: "xAI Grok",
    defaultBaseURL: "https://api.x.ai/v1",
    models: ["grok-2-latest", "grok-beta"],
    envName: "XAI_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://console.x.ai",
    keyHint: "Starts with xai-..."
  },
  {
    id: "mistral",
    name: "Mistral",
    defaultBaseURL: "https://api.mistral.ai/v1",
    models: ["mistral-large-latest", "mistral-small-latest", "codestral-latest"],
    envName: "MISTRAL_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://console.mistral.ai/api-keys",
    keyHint: "32-char key"
  },
  {
    id: "groq",
    name: "Groq",
    defaultBaseURL: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    envName: "GROQ_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://console.groq.com/keys",
    keyHint: "Starts with gsk_..."
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    defaultBaseURL: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
    envName: "DEEPSEEK_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://platform.deepseek.com/api_keys",
    keyHint: "Starts with sk-..."
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    defaultBaseURL: "https://openrouter.ai/api/v1",
    models: [
      "anthropic/claude-sonnet-4.5",
      "openai/gpt-5",
      "google/gemini-2.5-pro",
      "x-ai/grok-4",
      "meta-llama/llama-3.3-70b-instruct"
    ],
    envName: "OPENROUTER_API_KEY",
    kind: "openai-compat",
    docsUrl: "https://openrouter.ai/keys",
    keyHint: "Starts with sk-or-..."
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    defaultBaseURL: "",
    models: [],
    envName: "CUSTOM_API_KEY",
    kind: "openai-compat",
    docsUrl: "",
    keyHint: "Any OpenAI-compatible endpoint",
    requiresBaseURL: true
  }
];
function getProviderDef(id) {
  return PROVIDERS.find((p) => p.id === id);
}
function maskKey(key) {
  if (!key) return "";
  if (key.length <= 8) return "•".repeat(key.length);
  return `${key.slice(0, 3)}…${key.slice(-4)}`;
}
const SETTINGS_KEY = "vibecoder.settings.v1";
const PROJECTS_KEY = "vibecoder.projects.v1";
function isBrowser() {
  return typeof window !== "undefined";
}
function loadSettings() {
  if (!isBrowser()) return { providers: [] };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { providers: [] };
    return JSON.parse(raw);
  } catch {
    return { providers: [] };
  }
}
function saveSettings(s) {
  if (!isBrowser()) return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
function loadProjects() {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveProjects(projects) {
  if (!isBrowser()) return;
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
function getProject(id) {
  return loadProjects().find((p) => p.id === id);
}
function upsertProject(project) {
  const all = loadProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: Date.now() };
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  saveProjects(all);
}
function SettingsModal({ open, onOpenChange, onSaved }) {
  const [settings, setSettings] = useState({ providers: [] });
  const [adding, setAdding] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [draftBaseURL, setDraftBaseURL] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [testing, setTesting] = useState(null);
  const [testResults, setTestResults] = useState({});
  useEffect(() => {
    if (open) {
      setSettings(loadSettings());
      setTestResults({});
    }
  }, [open]);
  function persist(next) {
    setSettings(next);
    saveSettings(next);
    onSaved?.(next);
  }
  function addProvider() {
    if (!adding || !draftKey.trim()) {
      toast.error("Pick a provider and paste an API key");
      return;
    }
    const def = getProviderDef(adding);
    if (def.requiresBaseURL && !draftBaseURL.trim()) {
      toast.error("Custom provider needs a base URL");
      return;
    }
    const newKey = {
      id: nanoid(8),
      providerId: adding,
      label: draftLabel.trim() || def.name,
      apiKey: draftKey.trim(),
      baseURL: draftBaseURL.trim() || void 0,
      createdAt: Date.now()
    };
    const next = {
      ...settings,
      providers: [...settings.providers, newKey],
      defaultProviderKeyId: settings.defaultProviderKeyId ?? newKey.id,
      defaultModel: settings.defaultModel ?? def.models[0]
    };
    persist(next);
    setAdding("");
    setDraftKey("");
    setDraftBaseURL("");
    setDraftLabel("");
    toast.success(`Added ${def.name}`);
  }
  function removeProvider(id) {
    const next = {
      ...settings,
      providers: settings.providers.filter((p) => p.id !== id)
    };
    if (next.defaultProviderKeyId === id) {
      next.defaultProviderKeyId = next.providers[0]?.id;
      const def = next.providers[0] ? getProviderDef(next.providers[0].providerId) : void 0;
      next.defaultModel = def?.models[0];
    }
    persist(next);
  }
  async function testKey(pk) {
    const def = getProviderDef(pk.providerId);
    if (!def) return;
    setTesting(pk.id);
    try {
      if (def.kind === "gemini") {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(pk.apiKey)}`
        );
        if (!r.ok) throw new Error(String(r.status));
      } else if (def.kind === "anthropic") {
        const r = await fetch(`${(pk.baseURL || def.defaultBaseURL).replace(/\/$/, "")}/models`, {
          headers: {
            "x-api-key": pk.apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          }
        });
        if (!r.ok) throw new Error(String(r.status));
      } else {
        const headers = {};
        if (def.id === "lovable") headers["Lovable-API-Key"] = pk.apiKey;
        else headers["Authorization"] = `Bearer ${pk.apiKey}`;
        const r = await fetch(`${(pk.baseURL || def.defaultBaseURL).replace(/\/$/, "")}/models`, {
          headers
        });
        if (!r.ok) throw new Error(String(r.status));
      }
      setTestResults((s) => ({ ...s, [pk.id]: "ok" }));
      toast.success("Key works");
    } catch (e) {
      setTestResults((s) => ({ ...s, [pk.id]: "fail" }));
      toast.error(`Key test failed: ${e.message ?? e}`);
    } finally {
      setTesting(null);
    }
  }
  function setDefaultProvider(id) {
    const pk = settings.providers.find((p) => p.id === id);
    if (!pk) return;
    const def = getProviderDef(pk.providerId);
    persist({
      ...settings,
      defaultProviderKeyId: id,
      defaultModel: def?.models[0] ?? settings.defaultModel
    });
  }
  function setDefaultModel(model) {
    persist({ ...settings, defaultModel: model });
  }
  const defaultProvider = settings.providers.find((p) => p.id === settings.defaultProviderKeyId);
  const defaultDef = defaultProvider ? getProviderDef(defaultProvider.providerId) : void 0;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5" }),
        " AI Providers"
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Add API keys for any AI provider. Keys are stored only in this browser's localStorage and sent directly to the provider — never to a VibeCoder server." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      settings.providers.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground", children: "No providers yet. Add your first one below." }),
      settings.providers.map((pk) => {
        const def = getProviderDef(pk.providerId);
        const isDefault = settings.defaultProviderKeyId === pk.id;
        const tr = testResults[pk.id];
        return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium truncate", children: pk.label }),
              isDefault && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Default" }),
              tr === "ok" && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
              tr === "fail" && /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-red-500" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  onClick: () => testKey(pk),
                  disabled: testing === pk.id,
                  children: testing === pk.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : "Test"
                }
              ),
              !isDefault && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDefaultProvider(pk.id), children: "Make default" }),
              /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", onClick: () => removeProvider(pk.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: def?.name ?? pk.providerId }),
            /* @__PURE__ */ jsx("span", { className: "font-mono", children: maskKey(pk.apiKey) }),
            pk.baseURL && /* @__PURE__ */ jsx("span", { className: "font-mono truncate", children: pk.baseURL })
          ] })
        ] }, pk.id);
      }),
      defaultProvider && defaultDef && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Default model" }),
          /* @__PURE__ */ jsxs(Select, { value: settings.defaultModel, onValueChange: setDefaultModel, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Pick a model" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: defaultDef.models.map((m) => /* @__PURE__ */ jsx(SelectItem, { value: m, children: m }, m)) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Using ",
            defaultProvider.label,
            ". Type a custom model below if needed."
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Or type a custom model id",
              value: settings.defaultModel ?? "",
              onChange: (e) => setDefaultModel(e.target.value)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Add a provider" }),
        /* @__PURE__ */ jsxs(Select, { value: adding, onValueChange: setAdding, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Choose a provider…" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: PROVIDERS.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p.id, children: p.name }, p.id)) })
        ] }),
        adding && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          getProviderDef(adding)?.docsUrl && /* @__PURE__ */ jsxs(
            "a",
            {
              href: getProviderDef(adding).docsUrl,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-1 text-xs text-primary hover:underline",
              children: [
                "Get a key ",
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "password",
              placeholder: getProviderDef(adding)?.keyHint ?? "API key",
              value: draftKey,
              onChange: (e) => setDraftKey(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Label (optional)",
              value: draftLabel,
              onChange: (e) => setDraftLabel(e.target.value)
            }
          ),
          (getProviderDef(adding)?.requiresBaseURL || getProviderDef(adding)?.kind !== "gemini") && /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: `Base URL (default: ${getProviderDef(adding)?.defaultBaseURL || "—"})`,
              value: draftBaseURL,
              onChange: (e) => setDraftBaseURL(e.target.value)
            }
          ),
          /* @__PURE__ */ jsxs(Button, { onClick: addProvider, className: "w-full", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
            " Add"
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
const TOOL_SCHEMAS = [
  {
    name: "list_files",
    description: "List all file paths currently in the project.",
    parameters: { type: "object", properties: {}, required: [] }
  },
  {
    name: "read_file",
    description: "Read the full contents of a file by its path.",
    parameters: {
      type: "object",
      properties: { path: { type: "string", description: "File path, e.g. /App.tsx" } },
      required: ["path"]
    }
  },
  {
    name: "write_file",
    description: "Create a new file or completely overwrite an existing file with the given contents.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path, e.g. /components/Button.tsx" },
        content: { type: "string", description: "Full file contents" }
      },
      required: ["path", "content"]
    }
  },
  {
    name: "edit_file",
    description: "Edit a file by replacing exactly one occurrence of `find` with `replace`. Use for surgical edits.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path" },
        find: { type: "string", description: "Exact string to find" },
        replace: { type: "string", description: "Replacement string" }
      },
      required: ["path", "find", "replace"]
    }
  },
  {
    name: "delete_file",
    description: "Delete a file from the project.",
    parameters: {
      type: "object",
      properties: { path: { type: "string", description: "File path" } },
      required: ["path"]
    }
  },
  {
    name: "rename_file",
    description: "Rename or move a file from one path to another.",
    parameters: {
      type: "object",
      properties: {
        from: { type: "string", description: "Current path" },
        to: { type: "string", description: "New path" }
      },
      required: ["from", "to"]
    }
  },
  {
    name: "finish",
    description: "Call when the task is complete. Provide a short summary of what you built for the user.",
    parameters: {
      type: "object",
      properties: { summary: { type: "string", description: "Short user-facing summary" } },
      required: ["summary"]
    }
  }
];
function normalizePath(p) {
  if (!p.startsWith("/")) return "/" + p;
  return p;
}
function executeTool(name, args, files) {
  switch (name) {
    case "list_files":
      return { result: Object.keys(files).sort().join("\n") || "(empty)", files };
    case "read_file": {
      const path = normalizePath(String(args.path ?? ""));
      if (!(path in files)) return { result: `Error: file not found: ${path}`, files };
      return { result: files[path], files };
    }
    case "write_file": {
      const path = normalizePath(String(args.path ?? ""));
      const content = String(args.content ?? "");
      const next = { ...files, [path]: content };
      return { result: `Wrote ${path} (${content.length} chars)`, files: next };
    }
    case "edit_file": {
      const path = normalizePath(String(args.path ?? ""));
      const find = String(args.find ?? "");
      const replace = String(args.replace ?? "");
      if (!(path in files)) return { result: `Error: file not found: ${path}`, files };
      const original = files[path];
      const count = original.split(find).length - 1;
      if (count === 0) return { result: `Error: find string not found in ${path}`, files };
      if (count > 1)
        return {
          result: `Error: find string matches ${count} times in ${path}; make it more specific`,
          files
        };
      const next = { ...files, [path]: original.replace(find, replace) };
      return { result: `Edited ${path}`, files: next };
    }
    case "delete_file": {
      const path = normalizePath(String(args.path ?? ""));
      if (!(path in files)) return { result: `Error: file not found: ${path}`, files };
      const next = { ...files };
      delete next[path];
      return { result: `Deleted ${path}`, files: next };
    }
    case "rename_file": {
      const from = normalizePath(String(args.from ?? ""));
      const to = normalizePath(String(args.to ?? ""));
      if (!(from in files)) return { result: `Error: file not found: ${from}`, files };
      const next = { ...files };
      next[to] = next[from];
      delete next[from];
      return { result: `Renamed ${from} -> ${to}`, files: next };
    }
    case "finish": {
      const summary = String(args.summary ?? "Done.");
      return { result: summary, files, finished: true, summary };
    }
    default:
      return { result: `Error: unknown tool ${name}`, files };
  }
}
const SYSTEM_PROMPT = `You are VibeCoder, an expert AI software engineer building React + TypeScript single-page apps in a Sandpack browser sandbox.

ENVIRONMENT:
- Runtime: react@18 + react-dom@18 in Sandpack "react-ts" template.
- Entry file: /index.tsx mounts <App /> from /App.tsx into #root.
- You can use plain CSS via style props, or import a stylesheet.
- No bundler config, no Tailwind, no Node, no backend. Pure browser React.
- Available packages: react, react-dom. To use another npm package, ASK the user first.

RULES:
1. Always use tools — never paste code in chat.
2. Inspect files with list_files / read_file before editing.
3. Prefer edit_file for small changes, write_file for new files or full rewrites.
4. Keep components small and well-typed. Use modern React (hooks, functional components).
5. Make designs beautiful, polished, and unique. Avoid generic AI-look (purple gradients on white) unless asked.
6. When done, call the finish tool with a short summary. Do NOT keep calling tools after finishing.
7. If a request is ambiguous, make a thoughtful choice and proceed — don't ask trivial questions.

You operate in a loop: think, call a tool, see the result, repeat. Be efficient — most tasks should take 3-15 tool calls.`;
async function callModel(provider, def, model, messages) {
  if (def.kind === "gemini") return callGemini(provider, model, messages);
  if (def.kind === "anthropic") return callAnthropic(provider, def, model, messages);
  return callOpenAICompat(provider, def, model, messages);
}
async function callOpenAICompat(provider, def, model, messages) {
  const baseURL = (provider.baseURL || def.defaultBaseURL).replace(/\/$/, "");
  const oaMessages = messages.map((m) => {
    if (m.role === "tool") {
      return { role: "tool", content: m.content, tool_call_id: m.toolCallId };
    }
    if (m.role === "assistant" && m.toolCalls?.length) {
      return {
        role: "assistant",
        content: m.content || null,
        tool_calls: m.toolCalls.map((tc) => ({
          id: tc.id,
          type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.args) }
        }))
      };
    }
    return { role: m.role, content: m.content };
  });
  const headers = {
    "Content-Type": "application/json"
  };
  if (def.id === "lovable") {
    headers["Lovable-API-Key"] = provider.apiKey;
  } else {
    headers["Authorization"] = `Bearer ${provider.apiKey}`;
  }
  if (def.id === "openrouter") {
    headers["HTTP-Referer"] = typeof window !== "undefined" ? window.location.origin : "";
    headers["X-Title"] = "VibeCoder";
  }
  const tools = TOOL_SCHEMAS.map((t) => ({
    type: "function",
    function: { name: t.name, description: t.description, parameters: t.parameters }
  }));
  const res = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages: oaMessages, tools, tool_choice: "auto" })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${def.name} API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0]?.message ?? {};
  const toolCalls = (choice.tool_calls ?? []).map((tc) => ({
    id: tc.id ?? crypto.randomUUID(),
    name: tc.function?.name ?? "",
    args: safeParse(tc.function?.arguments ?? "{}")
  }));
  return { content: choice.content ?? "", toolCalls };
}
async function callAnthropic(provider, def, model, messages) {
  const baseURL = (provider.baseURL || def.defaultBaseURL).replace(/\/$/, "");
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const anthMessages = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "tool") {
      anthMessages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: m.toolCallId,
            content: m.content
          }
        ]
      });
      continue;
    }
    if (m.role === "assistant" && m.toolCalls?.length) {
      const blocks2 = [];
      if (m.content) blocks2.push({ type: "text", text: m.content });
      for (const tc of m.toolCalls) {
        blocks2.push({ type: "tool_use", id: tc.id, name: tc.name, input: tc.args });
      }
      anthMessages.push({ role: "assistant", content: blocks2 });
      continue;
    }
    anthMessages.push({ role: m.role, content: m.content });
  }
  const tools = TOOL_SCHEMAS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters
  }));
  const res = await fetch(`${baseURL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system,
      messages: anthMessages,
      tools
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const blocks = data.content ?? [];
  let content = "";
  const toolCalls = [];
  for (const b of blocks) {
    if (b.type === "text") content += b.text;
    if (b.type === "tool_use")
      toolCalls.push({ id: b.id, name: b.name, args: b.input ?? {} });
  }
  return { content, toolCalls };
}
async function callGemini(provider, model, messages) {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    if (m.role === "tool") {
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: m.toolName ?? "tool",
              response: { result: m.content }
            }
          }
        ]
      });
      continue;
    }
    if (m.role === "assistant" && m.toolCalls?.length) {
      const parts2 = [];
      if (m.content) parts2.push({ text: m.content });
      for (const tc of m.toolCalls) {
        parts2.push({ functionCall: { name: tc.name, args: tc.args } });
      }
      contents.push({ role: "model", parts: parts2 });
      continue;
    }
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    });
  }
  const tools = [
    {
      functionDeclarations: TOOL_SCHEMAS.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }))
    }
  ];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(provider.apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : void 0,
      contents,
      tools
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  let content = "";
  const toolCalls = [];
  for (const p of parts) {
    if (p.text) content += p.text;
    if (p.functionCall)
      toolCalls.push({
        id: crypto.randomUUID(),
        name: p.functionCall.name,
        args: p.functionCall.args ?? {}
      });
  }
  return { content, toolCalls };
}
function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
const MAX_TOOL_CALLS = 30;
function ChatPane({
  messages,
  files,
  provider,
  model,
  previewError,
  onClearError,
  plannerEnabled,
  onTogglePlanner,
  onCheckpoint,
  onChange,
  onOpenSettings
}) {
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, running]);
  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    setElapsed(0);
    const t = setInterval(() => setElapsed(Date.now() - start), 250);
    return () => clearInterval(t);
  }, [running]);
  async function send(promptOverride) {
    const text = (promptOverride ?? input).trim();
    if (!text || running) return;
    if (!provider) {
      toast.error("Add an AI provider in Settings first");
      onOpenSettings();
      return;
    }
    const def = getProviderDef(provider.providerId);
    if (!def) return;
    const userMsg = {
      id: nanoid(8),
      role: "user",
      content: text,
      createdAt: Date.now()
    };
    let currentMessages = [...messages, userMsg];
    let currentFiles = files;
    if (onCheckpoint && Object.keys(currentFiles).length > 0) {
      onCheckpoint({
        id: nanoid(8),
        label: text.slice(0, 60),
        files: { ...currentFiles },
        createdAt: Date.now()
      });
    }
    onChange({ messages: currentMessages, files: currentFiles });
    if (!promptOverride) setInput("");
    setRunning(true);
    setStepCount(0);
    const startedAt = Date.now();
    try {
      let systemPrompt = SYSTEM_PROMPT + "\n\nCurrent files:\n" + Object.keys(currentFiles).sort().join("\n");
      if (plannerEnabled) {
        const planMsgs = [
          {
            role: "system",
            content: "You are a senior product engineer. Given the user's request and the current file list, write a SHORT numbered plan (3-7 steps) in plain text. Do NOT call any tools. Do NOT write code. Be specific about files to create/edit."
          },
          { role: "user", content: `Files:
${Object.keys(currentFiles).sort().join("\n")}

Request: ${text}` }
        ];
        const plan = await callModel(provider, def, model, planMsgs);
        const planMsg = {
          id: nanoid(8),
          role: "assistant",
          content: "📋 Plan\n\n" + (plan.content || "(no plan returned)"),
          createdAt: Date.now()
        };
        currentMessages = [...currentMessages, planMsg];
        onChange({ messages: currentMessages, files: currentFiles });
        systemPrompt += "\n\nPlan you previously committed to:\n" + plan.content;
      }
      const unified = [{ role: "system", content: systemPrompt }];
      for (const m of currentMessages) {
        if (m.role === "user") unified.push({ role: "user", content: m.content });
        else if (m.role === "assistant")
          unified.push({
            role: "assistant",
            content: m.content,
            toolCalls: m.toolCalls?.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args }))
          });
        else if (m.role === "tool")
          unified.push({
            role: "tool",
            content: m.content,
            toolCallId: m.toolCalls?.[0]?.id,
            toolName: m.toolName
          });
      }
      let totalSteps = 0;
      for (let i = 0; i < MAX_TOOL_CALLS; i++) {
        const resp = await callModel(provider, def, model, unified);
        totalSteps += 1;
        setStepCount(totalSteps);
        const assistantMsg = {
          id: nanoid(8),
          role: "assistant",
          content: resp.content,
          toolCalls: resp.toolCalls.map((tc) => ({ id: tc.id, name: tc.name, args: tc.args })),
          createdAt: Date.now()
        };
        currentMessages = [...currentMessages, assistantMsg];
        unified.push({
          role: "assistant",
          content: resp.content,
          toolCalls: resp.toolCalls
        });
        onChange({ messages: currentMessages, files: currentFiles });
        if (resp.toolCalls.length === 0) break;
        let finished = false;
        for (const tc of resp.toolCalls) {
          const { result, files: nextFiles, finished: didFinish } = executeTool(
            tc.name,
            tc.args,
            currentFiles
          );
          currentFiles = nextFiles;
          const toolMsg = {
            id: nanoid(8),
            role: "tool",
            content: result,
            toolName: tc.name,
            toolCalls: [{ id: tc.id, name: tc.name, args: tc.args, result }],
            createdAt: Date.now()
          };
          currentMessages = [...currentMessages, toolMsg];
          unified.push({
            role: "tool",
            content: result.slice(0, 8e3),
            toolCallId: tc.id,
            toolName: tc.name
          });
          if (didFinish) finished = true;
        }
        onChange({ messages: currentMessages, files: currentFiles });
        if (finished) break;
      }
      const dur = Date.now() - startedAt;
      const lastIdx = [...currentMessages].reverse().findIndex((m) => m.role === "assistant");
      if (lastIdx !== -1) {
        const realIdx = currentMessages.length - 1 - lastIdx;
        currentMessages = currentMessages.map(
          (m, i) => i === realIdx ? { ...m, durationMs: dur, steps: totalSteps } : m
        );
        onChange({ messages: currentMessages, files: currentFiles });
      }
    } catch (e) {
      const errMsg = {
        id: nanoid(8),
        role: "assistant",
        content: `⚠️ ${e.message ?? String(e)}`,
        createdAt: Date.now()
      };
      onChange({ messages: [...currentMessages, errMsg], files: currentFiles });
      toast.error(e.message ?? "Agent error");
    } finally {
      setRunning(false);
    }
  }
  function fixError() {
    if (!previewError) return;
    const prompt = `The preview is showing this error — please fix it:

${previewError}`;
    onClearError?.();
    send(prompt);
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col bg-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b px-4 py-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: "VibeCoder" }),
        provider && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: model })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onTogglePlanner?.(!plannerEnabled),
          className: `text-xs flex items-center gap-1 px-2 py-1 rounded border ${plannerEnabled ? "bg-primary/10 border-primary/50 text-primary" : "text-muted-foreground hover:text-foreground"}`,
          title: "When on, the agent writes a short plan before coding.",
          children: [
            /* @__PURE__ */ jsx(ListChecks, { className: "h-3 w-3" }),
            " Plan first"
          ]
        }
      )
    ] }),
    previewError && !running && /* @__PURE__ */ jsxs("div", { className: "border-b bg-red-500/10 px-4 py-2 flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-red-500 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-red-600 dark:text-red-400", children: "Preview error detected" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate font-mono", children: previewError })
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: fixError, className: "h-7", children: [
        /* @__PURE__ */ jsx(Wand2, { className: "h-3 w-3 mr-1" }),
        " Auto-fix"
      ] })
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "p-4 space-y-3", children: [
      messages.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground text-center py-12", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsx("p", { children: "Describe what you want to build." }),
        /* @__PURE__ */ jsx("p", { className: "text-xs mt-1", children: 'e.g. "a pomodoro timer with a dark theme"' })
      ] }),
      messages.map((m) => /* @__PURE__ */ jsx(MessageRow, { m }, m.id)),
      running && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
        /* @__PURE__ */ jsx("span", { children: "Working…" }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
          " ",
          (elapsed / 1e3).toFixed(1),
          "s"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs", children: [
          "· ",
          stepCount,
          " step",
          stepCount === 1 ? "" : "s"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "border-t p-3 space-y-2", children: [
      /* @__PURE__ */ jsx(
        Textarea,
        {
          placeholder: provider ? "Tell the AI what to build…" : "Add an API key in Settings to start",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
          },
          rows: 3,
          disabled: running,
          className: "resize-none"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "⌘+Enter to send" }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => send(), disabled: running || !input.trim(), size: "sm", children: [
          running ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "ml-1", children: "Send" })
        ] })
      ] })
    ] })
  ] });
}
function MessageRow({ m }) {
  if (m.role === "user") {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("div", { className: "bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap", children: m.content }) });
  }
  if (m.role === "tool") {
    const tc = m.toolCalls?.[0];
    const isError = m.content.startsWith("Error");
    return /* @__PURE__ */ jsxs("div", { className: "text-xs flex items-start gap-2 text-muted-foreground", children: [
      isError ? /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 mt-0.5 text-red-500" }) : /* @__PURE__ */ jsx(Wrench, { className: "h-3 w-3 mt-0.5" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono", children: tc?.name }),
        tc && "path" in tc.args && /* @__PURE__ */ jsxs("span", { className: "font-mono ml-1", children: [
          "(",
          String(tc.args.path),
          ")"
        ] }),
        tc && "from" in tc.args && /* @__PURE__ */ jsxs("span", { className: "font-mono ml-1", children: [
          "(",
          String(tc.args.from),
          " → ",
          String(tc.args.to),
          ")"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "text-sm whitespace-pre-wrap leading-relaxed", children: [
    m.content,
    (m.durationMs || m.steps) && /* @__PURE__ */ jsxs("div", { className: "mt-1 text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-2", children: [
      m.durationMs && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
        " ",
        (m.durationMs / 1e3).toFixed(1),
        "s"
      ] }),
      m.steps && /* @__PURE__ */ jsxs("span", { children: [
        "· ",
        m.steps,
        " step",
        m.steps === 1 ? "" : "s"
      ] })
    ] })
  ] });
}
const MonacoEditor = lazy(() => import("@monaco-editor/react").then((m) => ({ default: m.default })));
function getLanguage(path) {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".jsx") || path.endsWith(".js")) return "javascript";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "plaintext";
}
function EditorPane({ files, onChange }) {
  const paths = useMemo(() => Object.keys(files).sort(), [files]);
  const [active, setActive] = useState(paths[0] ?? "");
  const current = active && active in files ? active : paths[0];
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-52 border-r bg-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 border-b text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(FolderIcon, { className: "h-3 w-3" }),
        " Files"
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "h-[calc(100%-2rem)]", children: /* @__PURE__ */ jsx("div", { className: "p-1", children: paths.map((p) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActive(p),
          className: `flex items-center gap-1.5 w-full text-left px-2 py-1 text-xs rounded hover:bg-accent ${current === p ? "bg-accent font-medium" : ""}`,
          children: [
            /* @__PURE__ */ jsx(FileIcon, { className: "h-3 w-3 flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "truncate", children: p })
          ]
        },
        p
      )) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: current ? /* @__PURE__ */ jsx(
      Suspense,
      {
        fallback: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) }),
        children: /* @__PURE__ */ jsx(
          MonacoEditor,
          {
            height: "100%",
            theme: "vs-dark",
            path: current,
            language: getLanguage(current),
            value: files[current],
            onChange: (value) => onChange({ ...files, [current]: value ?? "" }),
            options: {
              minimap: { enabled: false },
              fontSize: 13,
              tabSize: 2,
              scrollBeyondLastLine: false
            }
          }
        )
      }
    ) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: "No files yet" }) })
  ] });
}
const SandpackInner = lazy(() => import("./SandpackInner-cymZblFx.js"));
function PreviewPane({
  files,
  onError
}) {
  const sandpackFiles = useMemo(() => {
    const out = {};
    for (const [path, content] of Object.entries(files)) {
      out[path] = { code: content };
    }
    return out;
  }, [files]);
  return /* @__PURE__ */ jsx("div", { className: "h-full w-full bg-background", children: /* @__PURE__ */ jsx(
    Suspense,
    {
      fallback: /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground", children: /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) }),
      children: /* @__PURE__ */ jsx(SandpackInner, { files: sandpackFiles, onError })
    }
  ) });
}
function ProjectShell({ project, onChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({ providers: [] });
  const [previewError, setPreviewError] = useState(null);
  useEffect(() => {
    setSettings(loadSettings());
  }, []);
  useEffect(() => {
    if (settings.providers.length === 0) {
      setSettingsOpen(true);
    }
  }, [settings.providers.length]);
  const provider = useMemo(() => {
    const id = project.selectedProviderId ?? settings.defaultProviderKeyId;
    return settings.providers.find((p) => p.id === id) ?? settings.providers[0] ?? null;
  }, [project.selectedProviderId, settings]);
  const model = project.selectedModel ?? settings.defaultModel ?? "";
  function updateChat(next) {
    onChange({ ...project, messages: next.messages, files: next.files });
  }
  function addCheckpoint(cp) {
    const list = [...project.checkpoints ?? [], cp].slice(-20);
    onChange({ ...project, checkpoints: list });
  }
  function revertTo(cp) {
    onChange({ ...project, files: { ...cp.files } });
    toast.success(`Reverted to "${cp.label}"`);
  }
  function setPlanner(v) {
    onChange({ ...project, plannerEnabled: v });
  }
  async function exportZip() {
    const [{ default: JSZip }, { saveAs }] = await Promise.all([
      import("jszip"),
      import("file-saver")
    ]);
    const zip = new JSZip();
    for (const [path, content] of Object.entries(project.files)) {
      zip.file(path.replace(/^\//, ""), content);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${project.name.replace(/\s+/g, "-").toLowerCase()}.zip`);
    toast.success("Downloaded zip");
  }
  const checkpoints = [...project.checkpoints ?? []].reverse();
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen flex-col bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxs("header", { className: "border-b px-3 py-2 flex items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold truncate", children: project.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", children: [
            /* @__PURE__ */ jsx(History, { className: "h-4 w-4 mr-1" }),
            " History",
            checkpoints.length > 0 && /* @__PURE__ */ jsxs("span", { className: "ml-1 text-xs text-muted-foreground", children: [
              "(",
              checkpoints.length,
              ")"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { align: "end", className: "w-80 p-2 max-h-96 overflow-y-auto", children: checkpoints.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground p-2", children: "Each chat turn creates a checkpoint you can revert to." }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: checkpoints.map((cp) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-2 p-2 rounded hover:bg-muted/50 text-xs",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "truncate font-medium", children: cp.label || "(empty)" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
                    new Date(cp.createdAt).toLocaleTimeString(),
                    " ·",
                    " ",
                    Object.keys(cp.files).length,
                    " files"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => revertTo(cp), children: [
                  /* @__PURE__ */ jsx(Undo2, { className: "h-3 w-3 mr-1" }),
                  " Revert"
                ] })
              ]
            },
            cp.id
          )) }) })
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: exportZip, children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
          " Export"
        ] }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", onClick: () => setSettingsOpen(true), children: [
          /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 mr-1" }),
          " Settings"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(ResizablePanelGroup, { orientation: "horizontal", className: "flex-1", children: [
      /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 28, minSize: 20, children: /* @__PURE__ */ jsx(
        ChatPane,
        {
          messages: project.messages,
          files: project.files,
          provider,
          model,
          previewError,
          onClearError: () => setPreviewError(null),
          plannerEnabled: project.plannerEnabled,
          onTogglePlanner: setPlanner,
          onCheckpoint: addCheckpoint,
          onChange: updateChat,
          onOpenSettings: () => setSettingsOpen(true)
        }
      ) }),
      /* @__PURE__ */ jsx(ResizableHandle, { withHandle: true }),
      /* @__PURE__ */ jsx(ResizablePanel, { defaultSize: 72, children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "preview", className: "h-full flex flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b px-2 pt-1", children: /* @__PURE__ */ jsxs(TabsList, { className: "h-8", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "preview", className: "text-xs", children: "Preview" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "code", className: "text-xs", children: "Code" })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "preview", className: "flex-1 m-0", children: /* @__PURE__ */ jsx(PreviewPane, { files: project.files, onError: setPreviewError }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "code", className: "flex-1 m-0", children: /* @__PURE__ */ jsx(
          EditorPane,
          {
            files: project.files,
            onChange: (files) => onChange({ ...project, files })
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      SettingsModal,
      {
        open: settingsOpen,
        onOpenChange: setSettingsOpen,
        onSaved: (s) => setSettings(s)
      }
    )
  ] });
}
function ProjectPage() {
  const {
    projectId
  } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      navigate({
        to: "/"
      });
      return;
    }
    setProject(p);
    setLoaded(true);
  }, [projectId, navigate]);
  function update(next) {
    setProject(next);
    upsertProject(next);
  }
  if (!loaded || !project) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-screen items-center justify-center text-muted-foreground", children: "Loading…" });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-right" }),
    /* @__PURE__ */ jsx(ProjectShell, { project, onChange: update })
  ] });
}
export {
  ProjectPage as component
};
