"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, BookOpen, Bookmark, CheckCircle2, ChevronDown,
  Clock3, Code2, ExternalLink, FileText, GraduationCap, Layers3, Menu,
  Search, ShieldCheck, Sparkles, Target, Video, X,
  Terminal, Binary, Cpu, Network, Database, Workflow, Brain, RotateCcw,
  Cloud, LogIn
} from "lucide-react";
import AuthModal from "@/app/components/AuthModal";
import UserMenu from "@/app/components/UserMenu";
import { useAuth } from "@/app/context/AuthContext";

const officialBulletin = "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2026/04/202604081891089960.pdf";
const officialJECA = "https://wbjeeb.nic.in/jeca/";
const archive = "https://wbjeeb.nic.in/archive-event-jeca/page/2/";

const subjects = [
  {
    name: "C Programming",
    tag: "Programming",
    icon: Code2,
    color: "blue",
    topics: [
      "Variables and Data types",
      "IO Operations",
      "Operators and Expressions",
      "Control Flow statements",
      "Functions",
      "Array",
      "Pointers",
      "String Handling",
      "Structures and Unions",
      "Files Handling",
      "Pre-Processor Directives",
      "Command Line Arguments",
    ],
  },
  {
    name: "Object Oriented Programming",
    tag: "Programming",
    icon: Layers3,
    color: "violet",
    topics: [
      "Data Types",
      "If / Else If / Else",
      "Loops",
      "Function",
      "Switch case",
      "Pointer",
      "Structure",
      "Array",
      "String",
      "Function Overloading",
      "Function templates",
      "SCOPE of variable",
      "Type aliases (typedef / using)",
      "Unions",
      "Enumerated types (enum)",
      "Class",
      "Constructors",
      "Overloading Constructors",
      "Member initialization in constructors",
      "Pointers to classes",
      "Overloading Operators",
      "Keyword 'this'",
      "Static Members",
      "Const Member Functions",
      "Class Templates",
      "Template Specialization",
      "Namespace",
      "Friendship (Friend Functions & Friend Classes)",
      "Inheritance",
      "Polymorphism",
      "Virtual Members",
      "Abstract base class",
    ],
  },
  {
    name: "Unix",
    tag: "Systems & Hardware",
    icon: Terminal,
    color: "amber",
    topics: [
      "Commands: ls, ps, pwd, mv, cp, touch, cat",
      "Commands: time, cal, bc, sort, diff, wc, comm",
      "Commands: ln, du, kill, sleep",
      "Commands: chmod, chown, chgrp, top, nice, renice",
      "Commands: cut, paste, grep, file, whereis, which, echo",
      "Environment: env, PATH, CLASSPATH",
      "Search: find and its different options",
      "vi editor",
      "Shell & Wildcard",
      "Shell Scripting",
    ],
  },
  {
    name: "Data Structure",
    tag: "Core CS",
    icon: Binary,
    color: "cyan",
    topics: [
      "Searching",
      "Sorting",
      "Stack",
      "Queue",
      "Linked List",
      "Tree",
      "Graph",
    ],
  },
  {
    name: "Introduction of Computers",
    tag: "Systems & Hardware",
    icon: Cpu,
    color: "indigo",
    topics: [
      "Bus structure",
      "Basic I/O",
      "Subroutines",
      "Interrupt",
      "DMA",
      "RAM",
      "ROM",
      "Pipeline",
      "System calls",
    ],
  },
  {
    name: "Operating System",
    tag: "Core CS",
    icon: ShieldCheck,
    color: "orange",
    topics: [
      "Process",
      "Thread",
      "CPU Scheduling",
      "Deadlock",
      "Synchronization",
      "Memory Management",
      "Disk Management",
      "File Management",
    ],
  },
  {
    name: "Computer Network",
    tag: "Core CS",
    icon: Network,
    color: "pink",
    topics: [
      "Concepts of networking",
      "Application areas",
      "Classification",
      "Reference models",
      "Transmission environment & technologies",
      "Routing algorithms",
      "IP, UDP & TCP protocols",
      "IPv4 and IPv6",
      "Reliable data transferring methods",
      "Application protocols",
      "Network Security",
      "Management systems",
      "Perspectives of communication networks",
    ],
  },
  {
    name: "Database Management System",
    tag: "Core CS",
    icon: Database,
    color: "emerald",
    topics: [
      "Introductions to Databases",
      "ER diagram",
      "Relational Algebra",
      "Relational Calculus",
      "SQL",
      "Normalization",
      "Transactions",
      "Indexing",
      "Query optimization",
    ],
  },
  {
    name: "Software Engineering",
    tag: "Applied Computing",
    icon: Workflow,
    color: "teal",
    topics: [
      "Introduction to Software Engineering",
      "A Generic view of process",
      "Process models",
      "Software Requirements",
      "Requirements engineering process",
      "System models",
      "Design Engineering",
      "Testing Strategies",
      "Product metrices",
      "Metrices for Process & Products",
      "Risk management",
      "Quality Management",
    ],
  },
  {
    name: "Machine Learning",
    tag: "Applied Computing",
    icon: Brain,
    color: "purple",
    topics: [
      "Classification",
      "Decision Tree Learning",
      "Artificial Neural Networks",
      "Support Vector Machines",
      "Bayesian Learning",
      "Clustering",
      "Hidden Markov Models",
    ],
  },
];

const categories = ["All", "Programming", "Core CS", "Systems & Hardware", "Applied Computing"];

const resources = [
  { type: "Official", title: "JECA 2026 Information Bulletin", desc: "Official pattern, scoring rules, eligibility and syllabus appendix.", href: officialBulletin, label: "Open official PDF", icon: FileText },
  { type: "Official", title: "WBJEEB JECA portal", desc: "Notices, current updates, rank cards and counselling information.", href: officialJECA, label: "Visit WBJEEB", icon: ShieldCheck },
  { type: "PYQ Archive", title: "Previous-year question papers", desc: "Start with the official JECA archive and confirm paper availability by year.", href: "https://wbjeeb.nic.in/jeca-old-question-papers/", label: "Browse archive", icon: Bookmark },
];

const pyqs = [
  { year: "2025", label: "JECA 2025", note: "Official archive listing", href: "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2025/12/20251215189779980.pdf", status: "Find paper" },
  { year: "2024", label: "JECA 2024", note: "Official archive listing", href: "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2024/12/2024120269.pdf", status: "Find paper" },
  { year: "2023", label: "JECA 2023", note: "Official archive listing", href: "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2023/11/2023110987-1.pdf", status: "Find paper" },
  { year: "2022", label: "JECA 2022", note: "Official archive listing", href: "https://cdnbbsr.s3waas.gov.in/s3d2a27e83d429f0dcae6b937cf440aeb1/uploads/2023/11/2023110962.pdf", status: "Find paper" },
];

const navItems = [{ label: "Overview", href: "#overview" }, { label: "Syllabus", href: "#syllabus" }, { label: "Mock Tests", href: "/mock" }, { label: "PYQs", href: "#pyqs" }, { label: "Resources", href: "#resources" }, { label: "Exam pattern", href: "#exam-pattern" }];

export default function Home() {
  const { user, saveCloudTopics, fetchCloudTopics } = useAuth();
  const [query, setQuery] = useState("");
  const [activeSubject, setActiveSubject] = useState("All");
  const [expanded, setExpanded] = useState<string | null>("C Programming");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  // Load progress from browser storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jeca_checked_topics");
      if (saved) {
        setChecked(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // When user logs in, fetch cloud topics and merge with local progress
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    async function syncUserProgress() {
      setSyncing(true);
      try {
        const cloudTopics = await fetchCloudTopics();
        if (isMounted && cloudTopics) {
          setChecked((prev) => {
            const merged = Array.from(new Set([...prev, ...cloudTopics]));
            try {
              localStorage.setItem("jeca_checked_topics", JSON.stringify(merged));
            } catch {
              // Ignore
            }
            if (merged.length > cloudTopics.length) {
              saveCloudTopics(merged);
            }
            return merged;
          });
        } else if (isMounted && checked.length > 0) {
          // If user had no topics in cloud yet, upload local topics
          saveCloudTopics(checked);
        }
      } catch (err) {
        console.error("Cloud sync error:", err);
      } finally {
        if (isMounted) setSyncing(false);
      }
    }

    syncUserProgress();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleTopic = (id: string) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("jeca_checked_topics", JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      if (user) {
        saveCloudTopics(next);
      }
      return next;
    });
  };

  const handleBulkToggle = (subjectName: string, subjectTopics: string[]) => {
    const topicIds = subjectTopics.map((t) => subjectName + "::" + t);
    setChecked((prev) => {
      const allDone = topicIds.every((id) => prev.includes(id));
      const next = allDone ? prev.filter((id) => !topicIds.includes(id)) : Array.from(new Set([...prev, ...topicIds]));
      try {
        localStorage.setItem("jeca_checked_topics", JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      if (user) {
        saveCloudTopics(next);
      }
      return next;
    });
  };

  const clearAllProgress = () => {
    if (window.confirm("Reset your syllabus progress? This will uncheck all topics.")) {
      setChecked([]);
      try {
        localStorage.removeItem("jeca_checked_topics");
      } catch {
        // Ignore storage errors
      }
      if (user) {
        saveCloudTopics([]);
      }
    }
  };

  const handleForceSync = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSyncing(true);
    await saveCloudTopics(checked);
    setSyncing(false);
  };

  const visibleSubjects = useMemo(() => subjects.filter((s) => {
    const matchesQuery = (s.name + " " + s.topics.join(" ")).toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeSubject === "All" || s.tag === activeSubject;
    return matchesQuery && matchesCategory;
  }), [query, activeSubject]);

  const totalTopics = subjects.reduce((n, s) => n + s.topics.length, 0);
  const progress = totalTopics > 0 ? Math.round((checked.length / totalTopics) * 100) : 0;

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 grid-bg" />
      <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="#overview" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/30"><Code2 size={21} /></div>
            <div><div className="font-semibold tracking-tight text-white">JECA PrepHub <span className="text-blue-400">with Som</span></div><div className="text-[10px] uppercase tracking-[.22em] text-slate-500">Your prep. Your pace.</div></div>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map(item => <a key={item.label} href={item.href} className="text-sm text-slate-400 transition hover:text-white">{item.label}</a>)}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <UserMenu
              onOpenAuth={() => setAuthModalOpen(true)}
              completedCount={checked.length}
              totalTopics={totalTopics}
              onForceSync={handleForceSync}
              syncing={syncing}
            />
            <a href="#syllabus" className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400">Start preparing <ArrowRight size={16} /></a>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <UserMenu
              onOpenAuth={() => setAuthModalOpen(true)}
              completedCount={checked.length}
              totalTopics={totalTopics}
              onForceSync={handleForceSync}
              syncing={syncing}
            />
            <button className="rounded-lg border border-white/10 p-2 text-slate-300" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {mobileOpen && (
          <div className="border-t border-white/10 px-5 py-3 md:hidden">
            {navItems.map(item => <a onClick={() => setMobileOpen(false)} key={item.label} href={item.href} className="block py-2.5 text-sm text-slate-300">{item.label}</a>)}
          </div>
        )}
      </header>

      <section id="overview" className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="absolute right-[-100px] top-12 -z-10 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[110px]" />
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/[.08] px-3.5 py-2 text-xs font-medium text-blue-200"><Sparkles size={14} /> Built from a student's real JECA journey <span className="h-1 w-1 rounded-full bg-blue-300" /></div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-.055em] text-white sm:text-6xl lg:text-[70px]">Your JECA prep, <span className="text-gradient">finally in one place.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">A student-first guide to the syllabus, previous-year papers, trusted resources, and exam essentials — built to make your next step clear.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setAuthRedirectUrl("/mock");
                    setAuthModalOpen(true);
                  } else {
                    window.location.href = "/mock";
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-blue-400"
              >
                Take Mock Test (CBT) <ArrowRight size={17} />
              </button>
              <a href="#syllabus" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-5 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[.06]">Explore syllabus <ArrowDownRight size={17} /></a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500"><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Curated learning links</span><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Official facts linked</span><span className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400" /> Free to explore</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-5 rounded-[30px] bg-blue-500/[.08] blur-2xl" />
            <div className="relative rounded-[26px] border border-white/[.12] bg-[#0b1220]/95 p-5 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between border-b border-white/[.08] pb-5"><div><div className="text-xs text-slate-500">YOUR PREPARATION SPACE</div><div className="mt-1 text-lg font-semibold text-white">Make progress, one topic at a time.</div></div><div className="rounded-xl bg-blue-400/10 p-3 text-blue-300"><GraduationCap size={22} /></div></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><div className="text-xs text-slate-500">Syllabus subjects</div><div className="mt-2 text-3xl font-semibold text-white">10<span className="ml-1 text-sm font-normal text-slate-500">official subjects</span></div><div className="mt-2 text-xs text-blue-300">Appendix-6 verified</div></div>
                <div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><div className="text-xs text-slate-500">Your topic progress</div><div className="mt-2 text-3xl font-semibold text-white">{progress}<span className="text-base text-slate-400">%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${progress}%` }} /></div></div>
              </div>
              <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-400/[.055] p-4">
                <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-200">Suggested next step</span><span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-blue-200">Start here</span></div>
                <div className="mt-3 flex items-center gap-3"><div className="rounded-xl bg-blue-400/10 p-3 text-blue-300"><BookOpen size={19} /></div><div className="flex-1"><div className="text-sm font-semibold text-white">Review the official syllabus</div><div className="mt-1 text-xs text-slate-500">Confirm the scope before choosing resources.</div></div><a href={officialBulletin} target="_blank" rel="noreferrer" aria-label="Open official syllabus" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"><ExternalLink size={16} /></a></div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Student-built resource hub</span><span>Version 1.0</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="exam-pattern" className="border-y border-white/[.07] bg-white/[.018]">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Know the format</div><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">JECA 2026 exam pattern</h2></div><a href={officialBulletin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200">Read official bulletin <ExternalLink size={14} /></a></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ n: "100", l: "Total questions", d: "80 Category-I + 20 Category-II" }, { n: "120", l: "Maximum marks", d: "As stated in 2026 bulletin" }, { n: "2 hours", l: "Test duration", d: "OMR-based, English language" }, { n: "−0.25", l: "Category-I penalty", d: "Category-II has no negative marks" }].map(stat => <div key={stat.l} className="rounded-2xl border border-white/[.08] bg-[#0b1220] p-5"><div className="text-3xl font-semibold tracking-tight text-white">{stat.n}</div><div className="mt-1 text-sm font-medium text-slate-200">{stat.l}</div><div className="mt-2 text-xs leading-5 text-slate-500">{stat.d}</div></div>)}
          </div>
          <p className="mt-4 max-w-4xl text-xs leading-5 text-slate-500">Important: these figures describe the 2026 examination bulletin, not a confirmed future-year pattern. Category-I: one correct option, +1/−0.25. Category-II: one or more correct options, up to +2; partial-credit rules apply as specified by WBJEEB. Always check the latest bulletin for your exam year.</p>
        </div>
      </section>

      <section id="syllabus" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Build your foundation</div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Explore the syllabus</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Complete 10-subject syllabus officially specified in Appendix-6 of the WBJEEB JECA Information Bulletin. Search topics, expand any subject, and track your revision progress topic-by-topic.
            </p>
          </div>
          <a href={officialBulletin} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-blue-400/40 hover:text-white"><FileText size={16} /> Official syllabus PDF <ExternalLink size={14} /></a>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search any topic, command, or subject..." className="w-full rounded-xl border border-white/10 bg-[#0b1220] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400/50" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveSubject(cat)}
                className={`rounded-xl border px-3.5 py-2.5 text-xs font-medium transition sm:text-sm ${activeSubject === cat
                  ? "border-blue-400/40 bg-blue-400/10 text-blue-200 shadow-sm"
                  : "border-white/10 bg-[#0b1220] text-slate-400 hover:text-white hover:border-white/20"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Single Column Layout for Syllabus Subjects */}
        <div className="mt-6 flex flex-col gap-3.5">
          {visibleSubjects.map((subject) => {
            const Icon = subject.icon;
            const isOpen = expanded === subject.name || showAllTopics;
            const completedInSubject = subject.topics.filter(t => checked.includes(subject.name + "::" + t)).length;
            const subjectProgress = Math.round((completedInSubject / subject.topics.length) * 100);

            return (
              <div
                key={subject.name}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${isOpen
                  ? "border-blue-400/30 bg-[#0d1627] shadow-lg shadow-blue-500/[.03]"
                  : "border-white/[.08] bg-[#0b1220] hover:border-white/[.16]"
                  }`}
              >
                <button
                  onClick={() => setExpanded(isOpen && !showAllTopics ? null : subject.name)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[.02]"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[.08] text-blue-300">
                      <Icon size={21} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white text-base sm:text-lg">{subject.name}</span>
                        <span className="rounded-md border border-white/10 bg-white/[.04] px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                          {subject.tag}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span>{subject.topics.length} official topics</span>
                        <span>•</span>
                        <span className={completedInSubject > 0 ? "text-blue-300 font-medium" : ""}>
                          {completedInSubject} of {subject.topics.length} completed ({subjectProgress}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-400 transition-all duration-300"
                          style={{ width: `${subjectProgress}%` }}
                        />
                      </div>
                    </div>
                    <div className={`rounded-lg border border-white/10 p-1.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 bg-white/[.05] text-white" : ""}`}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-white/[.07] bg-[#070d18]/40 px-5 pb-5 pt-4">
                    <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/[.05] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-[.16em] text-slate-400">
                          Official Syllabus Checklist
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">
                          {completedInSubject} of {subject.topics.length} checked
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <button
                          onClick={() => handleBulkToggle(subject.name, subject.topics)}
                          className="text-blue-300 hover:text-blue-200 transition font-medium"
                        >
                          {completedInSubject === subject.topics.length
                            ? "Unmark all in subject"
                            : "Mark all as done"}
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          onClick={() => setShowAllTopics(!showAllTopics)}
                          className="text-slate-400 hover:text-slate-200 transition"
                        >
                          {showAllTopics ? "Collapse all subjects" : "Expand all subjects"}
                        </button>
                      </div>
                    </div>

                    {/* Checklist items in single column */}
                    <div className="flex flex-col gap-1.5">
                      {subject.topics
                        .filter(t => (t + " " + subject.name).toLowerCase().includes(query.toLowerCase()))
                        .map(topic => {
                          const id = subject.name + "::" + topic;
                          const done = checked.includes(id);
                          return (
                            <label
                              key={topic}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition ${done
                                ? "border-emerald-500/20 bg-emerald-500/[.03]"
                                : "border-white/[.05] bg-white/[.015] hover:border-blue-400/25 hover:bg-white/[.03]"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={done}
                                  onChange={() => toggleTopic(id)}
                                  className="h-4 w-4 rounded accent-blue-500 shrink-0 cursor-pointer"
                                />
                                <span className={`text-sm select-none ${done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                                  {topic}
                                </span>
                              </div>
                              <span className={`text-[11px] shrink-0 font-medium ${done ? "text-emerald-400/80" : "text-slate-600"}`}>
                                {done ? "Completed" : "To revise"}
                              </span>
                            </label>
                          );
                        })}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-white/10 px-4 py-2.5 text-xs text-slate-500">
                      <span>WBJEEB JECA Appendix-6 curriculum</span>
                      <span className="text-[11px] text-blue-300">Topic-level syllabus</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {visibleSubjects.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-10 text-center text-sm text-slate-500">
            No matching topics found for "{query}". Try searching for another term.
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-400/15 bg-blue-400/[.045] p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-medium text-white">Your revision progress</span>
              {user ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                  <Cloud size={11} /> Cloud Synced
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-medium text-blue-200 ring-1 ring-blue-400/30 transition hover:bg-blue-500/25"
                >
                  <LogIn size={11} /> Sign in to sync across devices
                </button>
              )}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {checked.length} of {totalTopics} official topics marked complete · {user ? `saved to ${user.displayName || user.email || "your account"}` : "saved in this browser"}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-blue-400 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-semibold text-blue-200">{progress}%</span>
            </div>
            {checked.length > 0 && (
              <button
                onClick={clearAllProgress}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.04] px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                title="Reset all checkboxes"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="pyqs" className="border-y border-white/[.07] bg-white/[.018]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><div className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Learn from past papers</div><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Previous-year questions</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Use previous papers to understand question style and identify revision gaps. Links below lead to the official archive; availability may vary by year.</p></div><a href={archive} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 text-sm text-blue-300 hover:text-blue-200">Open official archive <ArrowRight size={16} /></a></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{pyqs.map((paper, i) => <a key={paper.year} href={paper.href} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/[.08] bg-[#0b1220] p-5 transition hover:-translate-y-1 hover:border-blue-400/30"><div className="flex items-start justify-between"><div className="rounded-xl bg-blue-400/[.09] p-3 text-blue-300"><FileText size={20} /></div><ExternalLink size={15} className="text-slate-600 transition group-hover:text-blue-300" /></div><div className="mt-5 text-xs font-medium uppercase tracking-[.16em] text-slate-500">{paper.year}</div><div className="mt-1 font-semibold text-white">{paper.label}</div><div className="mt-2 text-xs text-slate-500">{paper.note}</div><div className="mt-5 flex items-center gap-2 text-sm text-blue-300">{paper.status}<ArrowRight size={14} /></div></a>)}</div>
          <div className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-4 text-xs leading-5 text-amber-100/70">Copyright note: this site links to official paper archives rather than rehosting PDFs. Add local copies only when you have permission or the material is explicitly provided for redistribution.</div>
        </div>
      </section>

      <section id="resources" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div><div className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">Less searching, more learning</div><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Trusted starting points</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Official sources first. Topic-specific videos, notes, and books can be added once each link has been checked for relevance and quality.</p></div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">{resources.map(resource => { const Icon = resource.icon; return <div key={resource.title} className="flex flex-col rounded-2xl border border-white/[.08] bg-[#0b1220] p-6 transition hover:border-blue-400/25"><div className="flex items-center justify-between"><div className="rounded-xl border border-blue-400/15 bg-blue-400/[.08] p-3 text-blue-300"><Icon size={21} /></div><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-400">{resource.type}</span></div><h3 className="mt-5 text-lg font-semibold text-white">{resource.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{resource.desc}</p><a href={resource.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-300 hover:text-blue-200">{resource.label}<ArrowRight size={15} /></a></div> })}</div>
        <div className="mt-8 rounded-2xl border border-white/[.08] bg-gradient-to-r from-blue-500/[.10] to-transparent p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="rounded-2xl bg-blue-400/10 p-4 text-blue-300"><Video size={24} /></div><div className="flex-1"><h3 className="text-lg font-semibold text-white">Topic-wise video library — coming next</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">The next content pass will map each syllabus topic to a recommended lecture, notes, estimated study time, and related PYQs. No unverified placeholder video links.</p></div><span className="w-fit rounded-full border border-blue-400/20 bg-blue-400/[.08] px-3 py-1.5 text-xs text-blue-200">Planned</span></div></div>
      </section>

      <section className="border-y border-white/[.07] bg-[#0b1220]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-20">
          <div><div className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">From one aspirant to another</div><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Built with experience. Made for the next batch.</h2><p className="mt-4 text-sm leading-7 text-slate-400">I created this hub to make the preparation journey less confusing for students who are about to start. The goal is simple: know what to study, find useful resources faster, and practise with purpose.</p><div className="mt-6 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-400/10 font-semibold text-blue-200">S</div><div><div className="text-sm font-semibold text-white">Somnath “Som”</div><div className="text-xs text-slate-500">JECA candidate · Student-built project</div></div></div></div>
          <div className="grid gap-3 sm:grid-cols-2">{[{ icon: BookOpen, title: "Study guide", desc: "Clear topic lists and a practical sequence." }, { icon: Target, title: "PYQ-first practice", desc: "Use past questions to spot recurring concepts." }, { icon: Clock3, title: "Consistent revision", desc: "Track what you have reviewed." }, { icon: Sparkles, title: "Mock tests later", desc: "A test engine with explanations is planned for a future phase." }].map(item => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-white/[.08] bg-white/[.02] p-5"><Icon size={20} className="text-blue-300" /><div className="mt-4 font-semibold text-white">{item.title}</div><div className="mt-2 text-sm leading-6 text-slate-500">{item.desc}</div></div> })}</div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[.08] pb-7 sm:flex-row sm:items-center"><div><div className="font-semibold text-white">JECA PrepHub <span className="text-blue-400">with Som</span></div><p className="mt-1 text-xs text-slate-500">An independent student resource. Not affiliated with WBJEEB.</p></div><div className="flex flex-wrap gap-5 text-xs text-slate-500"><a href={officialJECA} target="_blank" rel="noreferrer" className="hover:text-white">Official JECA portal</a><a href={officialBulletin} target="_blank" rel="noreferrer" className="hover:text-white">2026 bulletin</a><a href="#overview" className="hover:text-white">Back to top ↑</a></div></div>
        <div className="flex flex-col justify-between gap-2 pt-5 text-[11px] leading-5 text-slate-600 sm:flex-row"><span>© {new Date().getFullYear()} JECA PrepHub with Som. Made to help aspirants learn together.</span><span>Always verify exam-year details with the official bulletin.</span></div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthRedirectUrl(null);
        }}
        onSuccess={() => {
          if (authRedirectUrl) {
            window.location.href = authRedirectUrl;
          }
        }}
        customSubtitle={authRedirectUrl ? "Sign in to access official CBT Mock Tests" : undefined}
      />
    </main>
  );
}
