import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { 
  Key, X, Trash2, CheckCircle2, AlertTriangle, RefreshCw, 
  Send, Bot, User, Sparkles, Plus, ListTodo, Timer, Wrench, RotateCcw, Play, Home, ArrowRight, LayoutTemplate
} from "lucide-react";

export const Route = createFileRoute("/p/$projectId")({
  component: Dashboard,
});

type PageView = "home" | "chatbox";

type AIModel =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gpt-4o"
  | "claude-3.7-sonnet"
  | "local-llama"
  | "mistral"
  | "groq"
  | "deepseek"
  | "openrouter"
  | "custom";

type KeyProvider = "gemini" | "openai" | "anthropic" | "local" | "mistral" | "groq" | "deepseek" | "openrouter" | "custom";

interface SavedCredential {
  id: string;
  provider: KeyProvider;
  label: string;
  key: string;
}

interface BannerNotification {
  type: "success" | "error";
  message: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Project {
  id: string;
  name: string;
  date: Date;
  fileCount: number;
}

type FileObj = {
  name: string;
  language: string;
  content: string;
};

// 🌐 Dynamic Endpoint & Header Generator for Live Fallbacks
const getProviderConfig = (provider: KeyProvider, selectedModel: string) => {
  switch (provider) {
    case "openai":
      return {
        url: "https://api.openai.com/v1/chat/completions",
        model: selectedModel.startsWith("gpt") ? selectedModel : "gpt-4o",
        headers: (key: string) => ({ "Authorization": `Bearer ${key}` }),
        format: "openai" as const
      };
    case "anthropic":
      return {
        url: "https://api.anthropic.com/v1/messages",
        model: selectedModel.startsWith("claude") ? selectedModel : "claude-3-7-sonnet-20250219",
        headers: (key: string) => ({
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-profiles-allowed": "true"
        }),
        format: "anthropic" as const
      };
    case "deepseek":
      return {
        url: "https://api.deepseek.com/v1/chat/completions",
        model: "deepseek-chat",
        headers: (key: string) => ({ "Authorization": `Bearer ${key}` }),
        format: "openai" as const
      };
    case "groq":
      return {
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama3-8b-8192",
        headers: (key: string) => ({ "Authorization": `Bearer ${key}` }),
        format: "openai" as const
      };
    case "mistral":
      return {
        url: "https://api.mistral.ai/v1/chat/completions",
        model: "mistral-large-latest",
        headers: (key: string) => ({ "Authorization": `Bearer ${key}` }),
        format: "openai" as const
      };
    case "openrouter":
      return {
        url: "https://openrouter.ai/api/v1/chat/completions",
        model: "google/gemini-2.5-flash",
        headers: (key: string) => ({
          "Authorization": `Bearer ${key}`,
          "HTTP-Origin": window.location.origin,
          "Title": "VibeCoder"
        }),
        format: "openai" as const
      };
    case "local":
      return {
        url: "http://localhost:11434/v1/chat/completions",
        model: "llama3",
        headers: () => ({}),
        format: "openai" as const
      };
    default:
      return {
        url: "https://api.openai.com/v1/chat/completions",
        model: selectedModel,
        headers: (key: string) => ({ "Authorization": `Bearer ${key}` }),
        format: "openai" as const
      };
  }
};

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [activeFeatures, setActiveFeatures] = useState({
    planMode: false,
    liveTimer: false,
    autoFix: false,
    checkpoints: false
  });
  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini-2.5-flash");
  
  // 🔥 Multi-file State Support
  const [files, setFiles] = useState<FileObj[]>([
    {
      name: "index.html",
      language: "html",
      content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>VibeCoder Sandbox</title>\n</head>\n<body>\n  <div class="card">\n    <h1>Hello, VibeCoder! ✨</h1>\n    <p>I am your multi-file live execution sandbox.</p>\n  </div>\n</body>\n</html>`
    },
    {
      name: "styles.css",
      language: "css",
      content: `body {\n  font-family: system-ui, -apple-system, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n  background: linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 100%);\n  color: #1e293b;\n}\n.card {\n  background: white;\n  padding: 2rem 3rem;\n  border-radius: 1rem;\n  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);\n  text-align: center;\n}\nh1 { margin: 0 0 0.5rem 0; color: #4f46e5; }\np { margin: 0; color: #64748b; }`
    },
    {
      name: "script.js",
      language: "javascript",
      content: `console.log("Sandbox initialized!");`
    }
  ]);
  const [activeFileName, setActiveFileName] = useState<string>("index.html");

  const [buildSeconds, setBuildSeconds] = useState<number>(0);
  const [codeHistory, setCodeHistory] = useState<FileObj[][]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  const [isKeyPanelOpen, setIsKeyPanelOpen] = useState<boolean>(false);
  const [keyProvider, setKeyProvider] = useState<KeyProvider>("gemini");
  const [inputKey, setInputKey] = useState<string>("");
  const [customLabel, setCustomLabel] = useState<string>("");

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);

  const [notification, setNotification] = useState<BannerNotification | null>(null);
  const [savedProviders, setSavedProviders] = useState<SavedCredential[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am connected to your Multi-AI Sandbox environment. Let's start building! Describe an app you'd like to create.",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Bundle files together for the iframe preview
  const bundledPreview = () => {
    const html = files.find(f => f.name === "index.html")?.content || "";
    const css = files.find(f => f.name === "styles.css")?.content || "";
    const js = files.find(f => f.name === "script.js")?.content || "";
    
    let doc = html;
    if (css && doc.includes('</head>')) {
        doc = doc.replace('</head>', `<style>\n${css}\n</style>\n</head>`);
    } else if (css) {
        doc = `<style>\n${css}\n</style>\n` + doc;
    }

    if (js && doc.includes('</body>')) {
        doc = doc.replace('</body>', `<script>\n${js}\n</script>\n</body>`);
    } else if (js) {
        doc += `\n<script>\n${js}\n</script>`;
    }
    return doc;
  };

  const activeFile = files.find(f => f.name === activeFileName) || files[0];

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentPage === "chatbox" && isGenerating && activeFeatures.liveTimer) {
      interval = setInterval(() => {
        setBuildSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPage, isGenerating, activeFeatures.liveTimer]);

  const handleDeleteProject = (projectId: string) => {
    setRecentProjects((prev) => prev.filter((p) => p.id !== projectId));
    setNotification({ type: "success", message: "Project deleted successfully." });
  };

  const toggleFeature = (feature: keyof typeof activeFeatures) => {
    setActiveFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
  };

  const runKeyValidationProbe = async (provider: KeyProvider, secretKey: string): Promise<boolean> => {
    try {
      if (provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${secretKey}`);
        return res.status === 200;
      }
      
      const config = getProviderConfig(provider, "default");
      const testBody = config.format === "openai" 
        ? { model: config.model, messages: [{ role: "user", content: "ping" }], max_tokens: 5 }
        : { model: config.model, messages: [{ role: "user", content: "ping" }], max_tokens: 5 };

      const res = await fetch(config.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...config.headers(secretKey) },
        body: JSON.stringify(testBody)
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const handleTestAndAdd = async () => {
    if (!inputKey.trim()) return;
    setIsTesting(true);
    const isValid = await runKeyValidationProbe(keyProvider, inputKey.trim());
    setIsTesting(false);

    if (isValid) {
      setSavedProviders((prev) => [...prev, {
        id: crypto.randomUUID(), provider: keyProvider, label: customLabel.trim() || `${keyProvider} Key`, key: inputKey.trim(),
      }]);
      setNotification({ type: "success", message: "Key works! Added to pipeline wallet." });
      setInputKey(""); setCustomLabel("");
    } else {
      setNotification({ type: "error", message: "Key authentication probe failed. Check credentials." });
    }
  };

  const handleInlineTestKey = async (cred: SavedCredential) => {
    setTestingKeyId(cred.id);
    const isValid = await runKeyValidationProbe(cred.provider, cred.key);
    setTestingKeyId(null);
    setNotification({ type: isValid ? "success" : "error", message: isValid ? "Key connection online" : "Key authentication dead" });
  };

  const handleDeleteCredential = (id: string) => {
    setSavedProviders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRevertCode = () => {
    if (codeHistory.length > 0) {
      const previousFiles = codeHistory[codeHistory.length - 1];
      setFiles(previousFiles);
      setCodeHistory(prev => prev.slice(0, -1));
      setNotification({ type: "success", message: "Reverted to previous checkpoint." });
    }
  };

  const simulateErrorAndFix = () => {
    const mockError = `Uncaught TypeError: Cannot read properties of undefined (reading 'map')\n    at RenderList (App.tsx:42:15)`;
    const errorPrompt = `I am getting this error in my preview console. Please analyze the code and provide a fix:\n\n${mockError}`;
    sendToAI(errorPrompt);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;
    const rawPrompt = chatInput.trim();
    
    if (messages.length === 1 && recentProjects.length === 0) {
      const readableName = rawPrompt.length > 32 ? rawPrompt.substring(0, 32) + "..." : rawPrompt;
      setRecentProjects(prev => [
        { id: crypto.randomUUID(), name: readableName, date: new Date(), fileCount: 3 },
        ...prev
      ]);
    }

    setChatInput("");
    sendToAI(rawPrompt);
  };

  const extractFiles = (text: string): FileObj[] | null => {
    const htmlMatch = text.match(/```html\n([\s\S]*?)```/i);
    const cssMatch = text.match(/```css\n([\s\S]*?)```/i);
    const jsMatch = text.match(/
http://googleusercontent.com/immersive_entry_chip/0
