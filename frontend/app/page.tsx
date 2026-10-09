"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  ArrowRight,
  Brain,
  Clock3,
  FileText,
  GitBranch,
  Globe2,
  History,
  Network,
  Search,
  Settings,
  Sparkles,
  Bookmark,
  ExternalLink,
  MessageSquare,
  Database,
  Bot,
  FileSearch,
  Cpu,
  Workflow,
  Loader2,
  Plus,
  Minus,
  RotateCcw,
  X,
  Trash2,
  Check,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Source = {
  title?: string;
  description?: string;
  domain?: string;
  url: string;
};

type ResearchResult = {
  id: number;
  topic: string;
  report: string;
  sources: string[];
  created_at: string;
};

type ChatResult = {
  report_id: number;
  question: string;
  answer: string;
};

type GraphNodeType =
  | "core"
  | "concept"
  | "technology"
  | "source";

type GraphNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  type: GraphNodeType;
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
};

type GraphEdge = {
  from: string;
  to: string;
  label: string;
};

type PageView =
  | "research"
  | "history"
  | "graph"
  | "saved"
  | "settings";

/* =========================================================
   API
========================================================= */

const API_BASE_URL = "/api";

const HISTORY_KEY = "ai-research-history";
const SAVED_KEY = "ai-research-saved";

/* =========================================================
   DEMO SOURCES
========================================================= */

const demoSources: Source[] = [
  {
    title: "MIT Sloan Management Review",
    description: "AI and data science trends for 2026",
    domain: "sloanreview.mit.edu",
    url: "https://sloanreview.mit.edu/",
  },
  {
    title: "IBM Think",
    description: "Technology and AI predictions for 2026",
    domain: "ibm.com",
    url: "https://www.ibm.com/think",
  },
  {
    title: "Microsoft AI",
    description: "Emerging AI trends and developments",
    domain: "microsoft.com",
    url: "https://www.microsoft.com/en-us/ai",
  },
  {
    title: "ByteByteGo",
    description: "What's next in artificial intelligence",
    domain: "bytebytego.com",
    url: "https://bytebytego.com/",
  },
];

/* =========================================================
   KNOWLEDGE GRAPH
========================================================= */

const baseGraphNodes: GraphNode[] = [
  {
    id: "ai",
    label: "Artificial Intelligence",
    x: 50,
    y: 50,
    type: "core",
    icon: Brain,
  },
  {
    id: "llms",
    label: "LLMs",
    x: 25,
    y: 25,
    type: "technology",
    icon: Cpu,
  },
  {
    id: "reasoning",
    label: "Reasoning Models",
    x: 12,
    y: 12,
    type: "concept",
    icon: Brain,
  },
  {
    id: "rlvr",
    label: "RLVR",
    x: 36,
    y: 10,
    type: "concept",
    icon: Workflow,
  },
  {
    id: "rag",
    label: "RAG",
    x: 75,
    y: 25,
    type: "technology",
    icon: FileSearch,
  },
  {
    id: "vector-db",
    label: "Vector DB",
    x: 90,
    y: 12,
    type: "technology",
    icon: Database,
  },
  {
    id: "retrieval",
    label: "Retrieval",
    x: 88,
    y: 38,
    type: "concept",
    icon: Search,
  },
  {
    id: "agents",
    label: "AI Agents",
    x: 22,
    y: 72,
    type: "technology",
    icon: Bot,
  },
  {
    id: "multi-agent",
    label: "Multi-Agent",
    x: 8,
    y: 88,
    type: "concept",
    icon: Network,
  },
  {
    id: "tools",
    label: "Tools",
    x: 35,
    y: 90,
    type: "concept",
    icon: Settings,
  },
  {
    id: "automation",
    label: "Automation",
    x: 78,
    y: 72,
    type: "technology",
    icon: Workflow,
  },
  {
    id: "langgraph",
    label: "LangGraph",
    x: 93,
    y: 88,
    type: "technology",
    icon: GitBranch,
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    x: 50,
    y: 82,
    type: "concept",
    icon: Cpu,
  },
  {
    id: "gpu",
    label: "GPUs",
    x: 63,
    y: 94,
    type: "technology",
    icon: Cpu,
  },
  {
    id: "security",
    label: "AI Security",
    x: 62,
    y: 12,
    type: "concept",
    icon: Settings,
  },
  {
    id: "governance",
    label: "Governance",
    x: 38,
    y: 68,
    type: "concept",
    icon: Settings,
  },
  {
    id: "research",
    label: "Research",
    x: 50,
    y: 5,
    type: "concept",
    icon: FileText,
  },
];

const baseGraphEdges: GraphEdge[] = [
  { from: "ai", to: "llms", label: "uses" },
  { from: "ai", to: "rag", label: "enables" },
  { from: "ai", to: "agents", label: "powers" },
  { from: "ai", to: "automation", label: "drives" },
  { from: "ai", to: "research", label: "supports" },

  { from: "llms", to: "reasoning", label: "evolves into" },
  { from: "llms", to: "rlvr", label: "trained with" },
  { from: "llms", to: "agents", label: "powers" },

  { from: "rag", to: "vector-db", label: "uses" },
  { from: "rag", to: "retrieval", label: "performs" },
  { from: "rag", to: "research", label: "grounds" },

  { from: "agents", to: "tools", label: "use" },
  { from: "agents", to: "multi-agent", label: "coordinates" },
  { from: "agents", to: "automation", label: "enables" },

  {
    from: "multi-agent",
    to: "langgraph",
    label: "orchestrated by",
  },
  {
    from: "langgraph",
    to: "automation",
    label: "orchestrates",
  },

  {
    from: "automation",
    to: "infrastructure",
    label: "depends on",
  },
  {
    from: "infrastructure",
    to: "gpu",
    label: "powered by",
  },

  { from: "ai", to: "security", label: "requires" },
  {
    from: "security",
    to: "agents",
    label: "protects",
  },

  {
    from: "governance",
    to: "research",
    label: "guides",
  },
  {
    from: "research",
    to: "llms",
    label: "studies",
  },
  {
    from: "research",
    to: "agents",
    label: "explores",
  },
  {
    from: "research",
    to: "rag",
    label: "investigates",
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Home() {
  const [topic, setTopic] = useState("");
  const [research, setResearch] =
    useState<ResearchResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] =
    useState<ChatResult | null>(null);

  const [chatLoading, setChatLoading] = useState(false);

  const [selectedNode, setSelectedNode] = useState("ai");
  const [graphScale, setGraphScale] = useState(1);

  const [currentPage, setCurrentPage] =
    useState<PageView>("research");

  const [history, setHistory] =
    useState<ResearchResult[]>([]);

  const [savedReports, setSavedReports] =
    useState<ResearchResult[]>([]);

  const [isSaved, setIsSaved] = useState(false);

  const [graphSearch, setGraphSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  /* =======================================================
     LOAD LOCAL DATA
  ======================================================= */

  useEffect(() => {
    try {
      const storedHistory =
        localStorage.getItem(HISTORY_KEY);

      const storedSaved =
        localStorage.getItem(SAVED_KEY);

      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }

      if (storedSaved) {
        setSavedReports(JSON.parse(storedSaved));
      }
    } catch {
      console.error(
        "Could not load saved research data."
      );
    }
  }, []);

  /* =======================================================
     STORE HISTORY
  ======================================================= */

  function storeHistory(result: ResearchResult) {
    setHistory((previous) => {
      const withoutDuplicate = previous.filter(
        (item) => item.id !== result.id
      );

      const updated = [
        result,
        ...withoutDuplicate,
      ].slice(0, 30);

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  /* =======================================================
     SOURCES
  ======================================================= */

  const currentSources: Source[] = research
    ? research.sources.map((url) => {
        try {
          const parsed = new URL(url);
          const hostname = parsed.hostname.replace(
            "www.",
            ""
          );

          return {
            title: hostname,
            description:
              "Research source collected from the web",
            domain: hostname,
            url,
          };
        } catch {
          return {
            title: "Research Source",
            description:
              "Source collected during research",
            domain: url,
            url,
          };
        }
      })
    : demoSources;

  /* =======================================================
     KNOWLEDGE GRAPH
  ======================================================= */

  const graphData = useMemo(() => {
    const sourcePositions: [number, number][] = [
      [10, 48],
      [90, 52],
      [18, 58],
      [82, 60],
      [50, 96],
    ];

    const sourceNodes: GraphNode[] = (
      research?.sources || []
    )
      .slice(0, 5)
      .map((url, index) => {
        let label = `Source ${index + 1}`;

        try {
          label = new URL(url).hostname.replace(
            "www.",
            ""
          );
        } catch {}

        return {
          id: `source-${index}`,
          label,
          x: sourcePositions[index]?.[0] ?? 50,
          y: sourcePositions[index]?.[1] ?? 50,
          type: "source",
          icon: Globe2,
        };
      });

    const sourceEdges: GraphEdge[] =
      sourceNodes.map((node) => ({
        from: node.id,
        to: "research",
        label: "supports",
      }));

    return {
      nodes: [
        ...baseGraphNodes,
        ...sourceNodes,
      ],
      edges: [
        ...baseGraphEdges,
        ...sourceEdges,
      ],
    };
  }, [research]);

  /* =======================================================
     GRAPH SEARCH
  ======================================================= */

  const filteredGraphNodes =
    graphSearch.trim()
      ? graphData.nodes.filter((node) =>
          node.label
            .toLowerCase()
            .includes(
              graphSearch.toLowerCase().trim()
            )
        )
      : graphData.nodes;

  function searchGraph() {
    const first = filteredGraphNodes[0];

    if (first) {
      setSelectedNode(first.id);
      setCurrentPage("graph");
    }
  }

  /* =======================================================
     GENERATE RESEARCH
  ======================================================= */

  async function generateResearch() {
    const trimmedTopic = topic.trim();

    if (!trimmedTopic) {
      setError(
        "Please enter a research topic first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setAnswer(null);
    setQuestion("");
    setSelectedNode("ai");
    setIsSaved(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/research/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: trimmedTopic,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Research API response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate research."
        );
      }

      if (!data.id) {
        throw new Error(
          "Research API returned an invalid report."
        );
      }

      setResearch(data);
      storeHistory(data);
      setCurrentPage("research");
    } catch (err) {
      console.error(
        "Research error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating research."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     ASK AI
  ======================================================= */

  async function askAI() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question first.");
      return;
    }

    if (!research?.id) {
      setError(
        "Please generate a research report first."
      );
      return;
    }

    setChatLoading(true);
    setError("");
    setAnswer(null);

    try {
      console.log(
        "Sending Ask AI request:",
        {
          report_id: research.id,
          question: trimmedQuestion,
        }
      );

      const response = await fetch(
        `${API_BASE_URL}/chat/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_id: research.id,
            question: trimmedQuestion,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Ask AI response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to get AI answer."
        );
      }

      if (!data?.answer) {
        throw new Error(
          "AI returned an empty answer."
        );
      }

      setAnswer({
        report_id:
          data.report_id ?? research.id,
        question:
          data.question ?? trimmedQuestion,
        answer: data.answer,
      });
    } catch (err) {
      console.error(
        "Ask AI error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while asking AI."
      );
    } finally {
      setChatLoading(false);
    }
  }

  /* =======================================================
     SAVE REPORT
  ======================================================= */

  function saveCurrentReport() {
    if (!research) {
      setError(
        "Generate a research report first."
      );
      return;
    }

    setSavedReports((previous) => {
      const exists = previous.some(
        (item) => item.id === research.id
      );

      if (exists) {
        const updated = previous.filter(
          (item) => item.id !== research.id
        );

        localStorage.setItem(
          SAVED_KEY,
          JSON.stringify(updated)
        );

        setIsSaved(false);

        return updated;
      }

      const updated = [
        research,
        ...previous,
      ];

      localStorage.setItem(
        SAVED_KEY,
        JSON.stringify(updated)
      );

      setIsSaved(true);

      return updated;
    });
  }

  /* =======================================================
     OPEN REPORT
  ======================================================= */

  function openReport(
    report: ResearchResult
  ) {
    setResearch(report);
    setTopic(report.topic);
    setQuestion("");
    setAnswer(null);
    setSelectedNode("ai");

    setIsSaved(
      savedReports.some(
        (item) => item.id === report.id
      )
    );

    setCurrentPage("research");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     DELETE HISTORY
  ======================================================= */

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }

  /* =======================================================
     DELETE SAVED
  ======================================================= */

  function removeSaved(id: number) {
    setSavedReports((previous) => {
      const updated = previous.filter(
        (item) => item.id !== id
      );

      localStorage.setItem(
        SAVED_KEY,
        JSON.stringify(updated)
      );

      if (research?.id === id) {
        setIsSaved(false);
      }

      return updated;
    });
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function navigate(page: PageView) {
    setCurrentPage(page);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =======================================================
     CLEAR CHAT
  ======================================================= */

  function clearAnswer() {
    setAnswer(null);
    setQuestion("");
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className={`min-h-screen overflow-x-hidden ${
        darkMode
          ? "bg-[#05060d] text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

      {darkMode && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-[-15%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[150px]" />

          <div className="absolute right-[-8%] top-[12%] h-[450px] w-[450px] rounded-full bg-cyan-500/15 blur-[140px]" />

          <div className="absolute bottom-[-15%] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/15 blur-[150px]" />
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#05060d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          {/* LOGO */}

          <button
            onClick={() =>
              navigate("research")
            }
            className="flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-500/25">
              <Brain
                size={21}
                strokeWidth={2.2}
              />

              <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_15px_rgba(103,232,249,1)]" />
            </div>

            <div className="text-left">
              <h1 className="text-[15px] font-semibold tracking-tight">
                AI Research
                <span className="text-fuchsia-400">
                  .
                </span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Intelligence Workspace
              </p>
            </div>
          </button>

          {/* NAV */}

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem
              icon={<Search size={16} />}
              label="Research"
              active={
                currentPage === "research"
              }
              onClick={() =>
                navigate("research")
              }
            />

            <NavItem
              icon={<History size={16} />}
              label="History"
              active={
                currentPage === "history"
              }
              onClick={() =>
                navigate("history")
              }
            />

            <NavItem
              icon={<Network size={16} />}
              label="Knowledge Graph"
              active={
                currentPage === "graph"
              }
              onClick={() =>
                navigate("graph")
              }
            />

            <NavItem
              icon={<Bookmark size={16} />}
              label="Saved Reports"
              active={
                currentPage === "saved"
              }
              onClick={() =>
                navigate("saved")
              }
            />
          </nav>

          {/* RIGHT */}

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate("settings")
              }
              className={`hidden rounded-xl border p-2.5 transition sm:block ${
                currentPage === "settings"
                  ? "border-violet-400/40 bg-violet-500/10 text-violet-300"
                  : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-400/30 hover:text-white"
              }`}
              title="Settings"
            >
              <Settings size={17} />
            </button>

            <button
              onClick={() =>
                navigate("research")
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-sm font-semibold text-violet-200"
            >
              IB
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}

        <div className="flex gap-1 overflow-x-auto border-t border-white/[0.04] px-4 py-2 md:hidden">
          <MobileNav
            label="Research"
            active={
              currentPage === "research"
            }
            onClick={() =>
              navigate("research")
            }
          />

          <MobileNav
            label="History"
            active={
              currentPage === "history"
            }
            onClick={() =>
              navigate("history")
            }
          />

          <MobileNav
            label="Graph"
            active={
              currentPage === "graph"
            }
            onClick={() =>
              navigate("graph")
            }
          />

          <MobileNav
            label="Saved"
            active={
              currentPage === "saved"
            }
            onClick={() =>
              navigate("saved")
            }
          />

          <MobileNav
            label="Settings"
            active={
              currentPage === "settings"
            }
            onClick={() =>
              navigate("settings")
            }
          />
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="relative mx-auto max-w-[1500px] px-6 py-10 lg:px-10 lg:py-14">
        {/* HISTORY */}

        {currentPage === "history" && (
          <HistoryPage
            history={history}
            onOpen={openReport}
            onClear={clearHistory}
          />
        )}

        {/* SAVED */}

        {currentPage === "saved" && (
          <SavedPage
            reports={savedReports}
            onOpen={openReport}
            onRemove={removeSaved}
          />
        )}

        {/* SETTINGS */}

        {currentPage === "settings" && (
          <SettingsPage
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            historyCount={history.length}
            savedCount={savedReports.length}
          />
        )}

        {/* GRAPH */}

        {currentPage === "graph" && (
          <GraphPage
            graphData={graphData}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            graphScale={graphScale}
            setGraphScale={setGraphScale}
            graphSearch={graphSearch}
            setGraphSearch={setGraphSearch}
            searchGraph={searchGraph}
            research={research}
          />
        )}

        {/* =================================================
            RESEARCH PAGE
        ================================================= */}

        {currentPage === "research" && (
          <>
            {/* HERO */}

            <section className="grid items-center gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-xs font-medium text-violet-300">
                  <Sparkles size={14} />
                  AI-Powered Research Workspace
                </div>

                <h2 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-[64px]">
                  Research deeper.
                  <br />

                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">
                    Understand faster.
                  </span>
                </h2>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                  Search the web, synthesize
                  reliable sources, connect
                  research concepts, and ask
                  intelligent questions using
                  AI-powered research workflows.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/[0.07] px-3 py-2 text-[11px] font-medium text-fuchsia-300">
                    <GitBranch size={14} />
                    LangGraph-powered workflows
                  </div>

                  <button
                    onClick={() =>
                      navigate("graph")
                    }
                    className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-2 text-[11px] font-medium text-cyan-300 transition hover:border-cyan-300/40"
                  >
                    <Network size={14} />
                    Connected Knowledge
                  </button>
                </div>

                {/* SEARCH */}

                <div className="mt-8 max-w-3xl">
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#10121e]/90 p-2 shadow-2xl shadow-violet-950/30 transition focus-within:border-violet-400/50">
                    <Search
                      className="ml-3 shrink-0 text-slate-500"
                      size={21}
                    />

                    <input
                      type="text"
                      value={topic}
                      onChange={(e) =>
                        setTopic(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !loading
                        ) {
                          generateResearch();
                        }
                      }}
                      placeholder="What do you want to research?"
                      className="min-w-0 flex-1 bg-transparent px-1 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />

                    <button
                      onClick={
                        generateResearch
                      }
                      disabled={loading}
                      className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-5 py-3 text-sm font-semibold shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Sparkles size={16} />
                      )}

                      <span className="hidden sm:inline">
                        {loading
                          ? "Researching..."
                          : "Generate"}
                      </span>
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 flex items-start justify-between gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.06] px-4 py-3 text-xs text-red-300">
                      <span>{error}</span>

                      <button
                        onClick={() =>
                          setError("")
                        }
                        className="shrink-0 text-red-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-5 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Globe2 size={13} />
                    Web research
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Brain size={13} />
                    AI synthesis
                  </span>

                  <span className="flex items-center gap-1.5">
                    <GitBranch size={13} />
                    LangGraph
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Database size={13} />
                    RAG
                  </span>
                </div>
              </div>

              {/* AI VISUAL */}

              <div className="relative mx-auto h-[430px] w-full max-w-[600px]">
                <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[90px]" />

                <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10" />

                <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/10 border-dashed" />

                <svg className="absolute inset-0 h-full w-full">
                  <defs>
                    <linearGradient
                      id="heroLine"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#8b5cf6"
                        stopOpacity="0.1"
                      />

                      <stop
                        offset="50%"
                        stopColor="#d946ef"
                        stopOpacity="0.7"
                      />

                      <stop
                        offset="100%"
                        stopColor="#22d3ee"
                        stopOpacity="0.2"
                      />
                    </linearGradient>
                  </defs>

                  <line
                    x1="50%"
                    y1="50%"
                    x2="17%"
                    y2="22%"
                    stroke="url(#heroLine)"
                    strokeWidth="1.5"
                  />

                  <line
                    x1="50%"
                    y1="50%"
                    x2="83%"
                    y2="22%"
                    stroke="url(#heroLine)"
                    strokeWidth="1.5"
                  />

                  <line
                    x1="50%"
                    y1="50%"
                    x2="15%"
                    y2="78%"
                    stroke="url(#heroLine)"
                    strokeWidth="1.5"
                  />

                  <line
                    x1="50%"
                    y1="50%"
                    x2="85%"
                    y2="78%"
                    stroke="url(#heroLine)"
                    strokeWidth="1.5"
                  />

                  <line
                    x1="50%"
                    y1="50%"
                    x2="50%"
                    y2="12%"
                    stroke="url(#heroLine)"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* CORE */}

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] border border-violet-300/40 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-cyan-400/20 shadow-[0_0_70px_rgba(139,92,246,0.35)] backdrop-blur-xl">
                    <Brain
                      size={58}
                      strokeWidth={1.4}
                      className="text-violet-200"
                    />

                    <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,1)]" />
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-xs font-semibold text-violet-200">
                      AI Research Core
                    </span>

                    <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-slate-600">
                      <GitBranch size={10} />
                      LangGraph orchestration
                    </div>
                  </div>
                </div>

                <HeroNode
                  className="left-[5%] top-[12%]"
                  icon={<FileText size={20} />}
                  label="Research"
                  accent="violet"
                />

                <HeroNode
                  className="right-[5%] top-[12%]"
                  icon={<Cpu size={20} />}
                  label="LLMs"
                  accent="cyan"
                />

                <HeroNode
                  className="left-[3%] bottom-[12%]"
                  icon={<Database size={20} />}
                  label="RAG"
                  accent="fuchsia"
                />

                <HeroNode
                  className="right-[3%] bottom-[12%]"
                  icon={<Globe2 size={20} />}
                  label="Web Sources"
                  accent="cyan"
                />
              </div>
            </section>

            {/* =================================================
                REPORT + SOURCES
            ================================================= */}

            <section className="mt-16 grid gap-5 lg:grid-cols-[1.7fr_1fr]">
              {/* REPORT */}

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm lg:p-7">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-violet-300">
                      <FileText size={17} />

                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Research Report
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold">
                      {research?.topic ||
                        "Artificial Intelligence Trends in 2026"}
                    </h3>

                    {research && (
                      <p className="mt-2 text-[10px] text-slate-600">
                        Research ID: #{research.id}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={
                      saveCurrentReport
                    }
                    className={`rounded-xl border p-2 transition ${
                      isSaved
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/[0.07] text-slate-500 hover:text-white"
                    }`}
                    title={
                      isSaved
                        ? "Saved"
                        : "Save report"
                    }
                  >
                    {isSaved ? (
                      <Check size={17} />
                    ) : (
                      <Bookmark size={17} />
                    )}
                  </button>
                </div>

                {research ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                    {research.report}
                  </div>
                ) : (
                  <div className="space-y-4 text-sm leading-7 text-slate-400">
                    <p>
                      Artificial intelligence
                      continues to evolve rapidly
                      in 2026, with organizations
                      moving beyond experimentation
                      toward practical AI systems.
                    </p>

                    <p>
                      Large language models,
                      retrieval-augmented generation,
                      and agentic architectures are
                      enabling systems to reason across
                      multiple sources.
                    </p>

                    <p>
                      Generate a research topic above
                      to replace this preview with a
                      real AI-generated research report.
                    </p>
                  </div>
                )}
              </div>

              {/* SOURCES */}

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-cyan-300">
                      <Globe2 size={17} />

                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Sources
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold">
                      Research Sources
                    </h3>
                  </div>

                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium text-cyan-300">
                    {currentSources.length} sources
                  </span>
                </div>

                <div className="space-y-2">
                  {currentSources.map(
                    (source, index) => (
                      <a
                        key={`${source.url}-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-2xl border border-white/[0.05] bg-black/10 p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
                      >
                        <div className="flex gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/[0.08] text-xs font-semibold text-cyan-300">
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium text-slate-200">
                              {source.title}
                            </h4>

                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {source.description}
                            </p>

                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600">
                              {source.domain}
                              <ExternalLink size={10} />
                            </div>
                          </div>
                        </div>
                      </a>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* =================================================
                QUICK GRAPH
            ================================================= */}

            <section className="mt-5 overflow-hidden rounded-3xl border border-fuchsia-400/10 bg-white/[0.025]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-fuchsia-300">
                    <Network size={17} />

                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                      Knowledge Graph
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold">
                    Explore research connections
                  </h3>
                </div>

                <button
                  onClick={() =>
                    navigate("graph")
                  }
                  className="flex items-center gap-2 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/[0.06] px-4 py-2.5 text-xs font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/10"
                >
                  Open full graph
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <GraphMini
                  icon={<Brain size={18} />}
                  title="AI"
                  value="Core"
                />

                <GraphMini
                  icon={<Database size={18} />}
                  title="RAG"
                  value="Connected"
                />

                <GraphMini
                  icon={<Bot size={18} />}
                  title="AI Agents"
                  value="Linked"
                />

                <GraphMini
                  icon={<GitBranch size={18} />}
                  title="LangGraph"
                  value="Orchestrated"
                />
              </div>
            </section>

            {/* =================================================
                ASK AI
            ================================================= */}

            <section className="mt-5 overflow-hidden rounded-3xl border border-cyan-400/10 bg-white/[0.025]">
              <div className="p-6 lg:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-cyan-300">
                      <MessageSquare size={17} />

                      <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                        Research Assistant
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold">
                      Ask AI about this research
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Ask questions and get answers
                      from the generated research using
                      RAG.
                    </p>
                  </div>

                  {research && (
                    <div className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5 text-[10px] text-emerald-300">
                      Report #{research.id} connected
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-2">
                    <MessageSquare
                      size={18}
                      className="shrink-0 text-slate-600"
                    />

                    <input
                      type="text"
                      value={question}
                      onChange={(e) =>
                        setQuestion(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !chatLoading
                        ) {
                          askAI();
                        }
                      }}
                      placeholder={
                        research
                          ? "Ask something about this research..."
                          : "Generate research first..."
                      }
                      disabled={
                        !research ||
                        chatLoading
                      }
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed"
                    />

                    {question && (
                      <button
                        onClick={() =>
                          setQuestion("")
                        }
                        className="text-slate-600 transition hover:text-white"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={askAI}
                    disabled={
                      !research ||
                      !question.trim() ||
                      chatLoading
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {chatLoading ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Thinking...
                      </>
                    ) : (
                      <>
                        Ask AI
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* AI ANSWER */}

                {answer && (
                  <div className="mt-5 rounded-2xl border border-violet-400/10 bg-violet-500/[0.04] p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-violet-500/10 p-2 text-violet-300">
                          <Brain size={15} />
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-violet-200">
                            AI Answer
                          </span>

                          <p className="mt-0.5 text-[9px] text-slate-600">
                            Based on Research Report #
                            {answer.report_id}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={
                          clearAnswer
                        }
                        className="rounded-lg border border-white/[0.06] p-1.5 text-slate-600 transition hover:text-white"
                        title="Clear answer"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="mb-4 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                        Your question
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {answer.question}
                      </p>
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {answer.answer}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-[10px] text-slate-600 sm:flex-row">
          <span>
            AI Research Assistant · Intelligence
            Workspace
          </span>

          <div className="flex items-center gap-2">
            <Clock3 size={12} />
            Research generated with AI
          </div>
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
        active
          ? "bg-violet-500/10 text-violet-300"
          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* =========================================================
   MOBILE NAV
========================================================= */

function MobileNav({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-2 text-[10px] ${
        active
          ? "bg-violet-500/15 text-violet-300"
          : "text-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================================
   HISTORY PAGE
========================================================= */

function HistoryPage({
  history,
  onOpen,
  onClear,
}: {
  history: ResearchResult[];
  onOpen: (report: ResearchResult) => void;
  onClear: () => void;
}) {
  return (
    <section>
      <PageHeader
        icon={<History size={20} />}
        label="Research History"
        title="Your research history"
        description="Open previously generated research reports."
      />

      <div className="mb-5 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {history.length} saved research sessions
        </span>

        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 rounded-xl border border-red-400/10 bg-red-500/[0.04] px-3 py-2 text-xs text-red-300"
          >
            <Trash2 size={14} />
            Clear history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<History size={25} />}
          title="No research history yet"
          description="Generate your first research report and it will appear here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                onOpen(item)
              }
              className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:border-violet-400/30 hover:bg-violet-500/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-violet-400">
                    Report #{item.id}
                  </p>

                  <h3 className="mt-2 text-base font-semibold text-slate-200">
                    {item.topic}
                  </h3>
                </div>

                <ArrowRight
                  size={16}
                  className="text-slate-600 transition group-hover:text-violet-300"
                />
              </div>

              <p className="mt-4 line-clamp-3 text-xs leading-6 text-slate-500">
                {item.report}
              </p>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-600">
                <Clock3 size={12} />

                {new Date(
                  item.created_at
                ).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SAVED PAGE
========================================================= */

function SavedPage({
  reports,
  onOpen,
  onRemove,
}: {
  reports: ResearchResult[];
  onOpen: (report: ResearchResult) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <section>
      <PageHeader
        icon={<Bookmark size={20} />}
        label="Saved Reports"
        title="Your saved research"
        description="Keep important reports available for quick access."
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={25} />}
          title="No saved reports"
          description="Use the bookmark button on a research report to save it here."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {reports.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() =>
                    onOpen(item)
                  }
                  className="text-left"
                >
                  <p className="text-[10px] uppercase tracking-[0.15em] text-emerald-400">
                    Saved · #{item.id}
                  </p>

                  <h3 className="mt-2 text-base font-semibold text-slate-200">
                    {item.topic}
                  </h3>
                </button>

                <button
                  onClick={() =>
                    onRemove(item.id)
                  }
                  className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-300"
                  title="Remove saved report"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p className="mt-4 line-clamp-3 text-xs leading-6 text-slate-500">
                {item.report}
              </p>

              <button
                onClick={() =>
                  onOpen(item)
                }
                className="mt-4 flex items-center gap-2 text-xs text-violet-300"
              >
                Open report
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  darkMode,
  setDarkMode,
  historyCount,
  savedCount,
}: {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  historyCount: number;
  savedCount: number;
}) {
  return (
    <section>
      <PageHeader
        icon={<Settings size={20} />}
        label="Workspace Settings"
        title="Settings"
        description="Manage your research workspace preferences."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">
                Dark workspace
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Use the futuristic dark research interface.
              </p>
            </div>

            <button
              onClick={() =>
                setDarkMode(!darkMode)
              }
              className={`relative h-7 w-12 rounded-full transition ${
                darkMode
                  ? "bg-violet-500"
                  : "bg-slate-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  darkMode
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
          <h3 className="text-sm font-semibold">
            Workspace statistics
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard
              label="History"
              value={historyCount}
            />

            <StatCard
              label="Saved"
              value={savedCount}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
              <Cpu size={18} />
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                AI Research Engine
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Web research → AI synthesis →
                Knowledge Graph → RAG Assistant
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   GRAPH PAGE
========================================================= */

function GraphPage({
  graphData,
  selectedNode,
  setSelectedNode,
  graphScale,
  setGraphScale,
  graphSearch,
  setGraphSearch,
  searchGraph,
  research,
}: {
  graphData: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  selectedNode: string;
  setSelectedNode: (value: string) => void;
  graphScale: number;
  setGraphScale: (
    value:
      | number
      | ((value: number) => number)
  ) => void;
  graphSearch: string;
  setGraphSearch: (value: string) => void;
  searchGraph: () => void;
  research: ResearchResult | null;
}) {
  return (
    <section>
      <PageHeader
        icon={<Network size={20} />}
        label="Knowledge Graph"
        title="Explore research connections"
        description="Explore concepts, technologies, agents, relationships and research sources."
      />

      {/* SEARCH */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4">
          <Search
            size={17}
            className="text-slate-600"
          />

          <input
            value={graphSearch}
            onChange={(e) =>
              setGraphSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchGraph();
              }
            }}
            placeholder="Search graph concepts..."
            className="flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-slate-600"
          />
        </div>

        <button
          onClick={searchGraph}
          className="rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-6 py-3 text-sm font-semibold"
        >
          Search Graph
        </button>
      </div>

      {/* GRAPH CONTAINER */}

      <div className="overflow-hidden rounded-3xl border border-fuchsia-400/10 bg-[#050711]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-400/10 bg-violet-500/[0.06] px-3 py-1.5 text-[10px] text-violet-300">
              {graphData.nodes.length} nodes
            </span>

            <span className="rounded-full border border-cyan-400/10 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] text-cyan-300">
              {graphData.edges.length} relationships
            </span>

            {research && (
              <span className="rounded-full border border-emerald-400/10 bg-emerald-500/[0.05] px-3 py-1.5 text-[10px] text-emerald-300">
                Research #{research.id}
              </span>
            )}
          </div>

          <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-black/50">
            <button
              onClick={() =>
                setGraphScale(
                  (value) =>
                    Math.min(
                      1.5,
                      Number(
                        (
                          value + 0.1
                        ).toFixed(1)
                      )
                    )
                )
              }
              className="p-2.5 text-slate-400 hover:text-white"
            >
              <Plus size={15} />
            </button>

            <button
              onClick={() =>
                setGraphScale(
                  (value) =>
                    Math.max(
                      0.7,
                      Number(
                        (
                          value - 0.1
                        ).toFixed(1)
                      )
                    )
                )
              }
              className="border-l border-white/[0.08] p-2.5 text-slate-400 hover:text-white"
            >
              <Minus size={15} />
            </button>

            <button
              onClick={() => {
                setGraphScale(1);
                setSelectedNode("ai");
              }}
              className="border-l border-white/[0.08] p-2.5 text-slate-400 hover:text-white"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* GRAPH CANVAS */}

        <div className="relative h-[680px] overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)",
              backgroundSize: "38px 38px",
            }}
          />

          <div
            className="absolute inset-0 origin-center transition-transform duration-300"
            style={{
              transform: `scale(${graphScale})`,
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="fullGraphGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#8b5cf6"
                    stopOpacity="0.15"
                  />

                  <stop
                    offset="50%"
                    stopColor="#d946ef"
                    stopOpacity="0.8"
                  />

                  <stop
                    offset="100%"
                    stopColor="#22d3ee"
                    stopOpacity="0.2"
                  />
                </linearGradient>
              </defs>

              {graphData.edges.map(
                (edge, index) => {
                  const from =
                    graphData.nodes.find(
                      (node) =>
                        node.id ===
                        edge.from
                    );

                  const to =
                    graphData.nodes.find(
                      (node) =>
                        node.id ===
                        edge.to
                    );

                  if (!from || !to) {
                    return null;
                  }

                  const active =
                    selectedNode ===
                      from.id ||
                    selectedNode ===
                      to.id;

                  return (
                    <g
                      key={`${edge.from}-${edge.to}-${index}`}
                    >
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={
                          active
                            ? "#d946ef"
                            : "url(#fullGraphGradient)"
                        }
                        strokeWidth={
                          active
                            ? 0.5
                            : 0.25
                        }
                        strokeDasharray={
                          active
                            ? "1.2 0.8"
                            : undefined
                        }
                      />

                      {active && (
                        <text
                          x={
                            (from.x +
                              to.x) /
                            2
                          }
                          y={
                            (from.y +
                              to.y) /
                              2 -
                            1
                          }
                          fill="#cbd5e1"
                          fontSize="1.5"
                          textAnchor="middle"
                        >
                          {edge.label}
                        </text>
                      )}
                    </g>
                  );
                }
              )}
            </svg>

            {/* GRAPH NODES */}

            {graphData.nodes.map(
              (node) => {
                const Icon = node.icon;

                const connected =
                  selectedNode ===
                    node.id ||
                  graphData.edges.some(
                    (edge) =>
                      (edge.from ===
                        selectedNode &&
                        edge.to ===
                          node.id) ||
                      (edge.to ===
                        selectedNode &&
                        edge.from ===
                          node.id)
                  );

                let style =
                  "border-fuchsia-300/25 bg-fuchsia-500/[0.07] text-fuchsia-300";

                if (
                  node.type === "core"
                ) {
                  style =
                    "border-violet-300/70 bg-violet-500/25 text-violet-200 shadow-[0_0_65px_rgba(139,92,246,0.55)]";
                }

                if (
                  node.type ===
                  "technology"
                ) {
                  style =
                    "border-cyan-300/30 bg-cyan-400/[0.08] text-cyan-300";
                }

                if (
                  node.type === "source"
                ) {
                  style =
                    "border-emerald-300/30 bg-emerald-400/[0.07] text-emerald-300";
                }

                return (
                  <button
                    key={node.id}
                    onClick={() =>
                      setSelectedNode(
                        node.id
                      )
                    }
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                      connected ||
                      selectedNode ===
                        "ai"
                        ? "opacity-100"
                        : "opacity-25"
                    }`}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`flex items-center justify-center rounded-full border backdrop-blur-xl ${style} ${
                          node.type ===
                          "core"
                            ? "h-24 w-24"
                            : node.type ===
                                "source"
                              ? "h-12 w-12"
                              : "h-16 w-16"
                        } ${
                          selectedNode ===
                          node.id
                            ? "scale-110 ring-2 ring-fuchsia-400/60"
                            : ""
                        }`}
                      >
                        <Icon
                          size={
                            node.type ===
                            "core"
                              ? 34
                              : node.type ===
                                  "source"
                                ? 15
                                : 21
                          }
                        />
                      </div>

                      <span
                        className={`whitespace-nowrap text-center ${
                          node.type ===
                          "core"
                            ? "text-xs font-semibold text-violet-200"
                            : node.type ===
                                "source"
                              ? "text-[9px] text-emerald-300"
                              : "text-[10px] text-slate-400"
                        }`}
                      >
                        {node.label}
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* SELECTED NODE */}

          <div className="absolute bottom-5 left-5 z-20 max-w-[360px] rounded-2xl border border-white/[0.08] bg-black/70 p-4 backdrop-blur-xl">
            {(() => {
              const node =
                graphData.nodes.find(
                  (item) =>
                    item.id ===
                    selectedNode
                );

              if (!node) {
                return null;
              }

              const relationships =
                graphData.edges.filter(
                  (edge) =>
                    edge.from ===
                      selectedNode ||
                    edge.to ===
                      selectedNode
                );

              return (
                <>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-fuchsia-500/10 p-2 text-fuchsia-300">
                      <Network size={14} />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
                        Selected concept
                      </p>

                      <p className="text-xs font-semibold text-slate-200">
                        {node.label}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] text-slate-500">
                    {relationships.length}{" "}
                    connected relationships
                  </p>

                  <div className="mt-3 max-h-28 space-y-1 overflow-y-auto">
                    {relationships
                      .slice(0, 7)
                      .map(
                        (
                          edge,
                          index
                        ) => {
                          const otherId =
                            edge.from ===
                            selectedNode
                              ? edge.to
                              : edge.from;

                          const other =
                            graphData.nodes.find(
                              (
                                item
                              ) =>
                                item.id ===
                                otherId
                            );

                          return (
                            <div
                              key={`${edge.label}-${index}`}
                              className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 text-[9px]"
                            >
                              <span className="truncate text-slate-400">
                                {
                                  other?.label
                                }
                              </span>

                              <span className="shrink-0 text-fuchsia-300">
                                {
                                  edge.label
                                }
                              </span>
                            </div>
                          );
                        }
                      )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({
  icon,
  label,
  title,
  description,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2 text-violet-300">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <h3 className="mt-5 text-base font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-violet-300">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   GRAPH MINI
========================================================= */

function GraphMini({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-500/10 p-2 text-violet-300">
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium text-slate-300">
            {title}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-600">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO NODE
========================================================= */

function HeroNode({
  className,
  icon,
  label,
  accent,
}: {
  className: string;
  icon: ReactNode;
  label: string;
  accent:
    | "violet"
    | "cyan"
    | "fuchsia";
}) {
  const styles = {
    violet:
      "border-violet-400/20 bg-violet-500/[0.08] text-violet-300",
    cyan:
      "border-cyan-400/20 bg-cyan-500/[0.07] text-cyan-300",
    fuchsia:
      "border-fuchsia-400/20 bg-fuchsia-500/[0.07] text-fuchsia-300",
  };

  return (
    <div
      className={`absolute ${className}`}
    >
      <div
        className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-3 backdrop-blur-xl ${styles[accent]}`}
      >
        {icon}

        <span className="whitespace-nowrap text-[10px] font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}