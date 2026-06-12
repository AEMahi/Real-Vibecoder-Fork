import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { 
  Key, X, Trash2, CheckCircle2, AlertTriangle, RefreshCw, 
  Send, Bot, User, Sparkles, Plus, ListTodo, Timer, Wrench, RotateCcw, Play, Home, ArrowRight
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

function Dashboard() {
  const [currentPage, setCurrentPage] = useState<PageView>("home");
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);

  const [activeFeatures, setActiveFeatures] = useState({
    planMode: false,
    liveTimer: false,
    autoFix: false,
    checkpoints: false
  });

  const [selectedModel, setSelectedModel] = useState<AIModel>("gemini-2.5-flash");
  const [code, setCode] = useState<string>(
    `// Selected Engine: ${selectedModel}\nfunction init() {\n  console.log("Hello from your sandbox workspace!");\n}`
  );
  
  const [buildSeconds, setBuildSeconds] = useState<number>(0);
  const [codeHistory, setCodeHistory] = useState<string[]>([]);

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
      content: "Hello! I am connected to your Multi-AI Sandbox environment. Let's start writing some code!",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
    setCode((prev) =>
      `// Switched engine context to: ${model}\n` +
      prev.replace(/\/\/ Selected Engine: .*\n|\/\/ Switched engine context to: .*\n/, "")
    );
  };

  const runKeyValidationProbe = async (provider: KeyProvider, secretKey: string): Promise<boolean> => {
    try {
      if (provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${secretKey}`);
        return res.status === 200;
      }
      return true; 
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
      setNotification({ type: "success", message: "Key works! You are ready to build." });
      setInputKey(""); setCustomLabel("");
    } else {
      setNotification({ type: "error", message: "Key is not working. Please check it and try again." });
    }
  };

  const handleInlineTestKey = async (cred: SavedCredential) => {
    setTestingKeyId(cred.id);
    const isValid = await runKeyValidationProbe(cred.provider, cred.key);
    setTestingKeyId(null);
    setNotification({ type: isValid ? "success" : "error", message: isValid ? "Key works" : "Key is not working" });
  };

  const handleDeleteCredential = (id: string) => {
    setSavedProviders((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRevertCode = () => {
    if (codeHistory.length > 0) {
      const previousCode = codeHistory[codeHistory.length - 1];
      setCode(previousCode);
      setCodeHistory(prev => prev.slice(0, -1));
      setNotification({ type: "success", message: "Reverted to previous checkpoint." });
    }
  };

  const simulateErrorAndFix = () => {
    const mockError = `Uncaught TypeError: Cannot read properties of undefined (reading 'map')\n    at RenderList (App.tsx:42:15)\n    at React Component Tree`;
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
        { id: crypto.randomUUID(), name: readableName, date: new Date(), fileCount: 1 },
        ...prev
      ]);
    }

    setChatInput("");
    sendToAI(rawPrompt);
  };

  // Regex function to extract markdown code blocks safely
  const extractCode = (text: string) => {
    const match = text.match(/
http://googleusercontent.com/immersive_entry_chip/0
