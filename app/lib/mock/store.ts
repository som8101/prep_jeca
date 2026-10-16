import { create } from "zustand";
import { ClientQuestion, ExamConfig, AnswerItem } from "./schemas";
import { saveLocalSession, clearLocalSession } from "./idb";

export type PaletteStatus =
  | "answered"
  | "not-answered"
  | "marked-review"
  | "answered-marked"
  | "not-visited";

interface ExamStoreState {
  attemptId: string | null;
  examConfig: ExamConfig | null;
  questions: ClientQuestion[];
  currentQuestionIndex: number;
  activeSectionId: string;
  answers: Record<string, AnswerItem>;
  visitedQuestions: string[];
  remainingSeconds: number;
  status: "IDLE" | "LOADING" | "ACTIVE" | "SUBMITTING" | "COMPLETED" | "ERROR";
  errorMessage: string | null;
  syncStatus: "SAVED" | "SAVING" | "ERROR";
  lastSavedAt: number;

  // Anti-Cheat & Modals
  warnings: number;
  showWarningModal: boolean;
  warningReason: string;
  showCalculator: boolean;
  showSubmitModal: boolean;
  resultId: string | null;

  // Actions
  initSession: (params: {
    attemptId: string;
    examConfig: ExamConfig;
    questions: ClientQuestion[];
    remainingSeconds: number;
    initialAnswers?: Record<string, AnswerItem>;
    initialVisited?: string[];
    initialQuestionIndex?: number;
    warnings?: number;
  }) => void;
  selectOption: (questionId: string, value: number | string, isMulti: boolean) => void;
  clearResponse: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  navigateToQuestion: (index: number) => void;
  navigateToNext: () => void;
  navigateToPrev: () => void;
  switchSection: (sectionId: string) => void;
  tickTimer: () => void;
  triggerWarning: (reason: string) => void;
  dismissWarning: () => void;
  setShowCalculator: (show: boolean) => void;
  setShowSubmitModal: (show: boolean) => void;
  syncToServer: () => Promise<void>;
  submitExam: (isAutoSubmit?: boolean) => Promise<string | null>;
  getPaletteStatus: (questionId: string) => PaletteStatus;
}

let syncTimeout: any = null;

export const useExamStore = create<ExamStoreState>((set, get) => ({
  attemptId: null,
  examConfig: null,
  questions: [],
  currentQuestionIndex: 0,
  activeSectionId: "",
  answers: {},
  visitedQuestions: [],
  remainingSeconds: 0,
  status: "IDLE",
  errorMessage: null,
  syncStatus: "SAVED",
  lastSavedAt: Date.now(),

  warnings: 0,
  showWarningModal: false,
  warningReason: "",
  showCalculator: false,
  showSubmitModal: false,
  resultId: null,

  initSession: ({
    attemptId,
    examConfig,
    questions,
    remainingSeconds,
    initialAnswers = {},
    initialVisited = [],
    initialQuestionIndex = 0,
    warnings = 0,
  }) => {
    const firstQId = questions[initialQuestionIndex]?.id;
    const visited = Array.from(new Set([...initialVisited, firstQId].filter(Boolean) as string[]));
    const activeSectionId = examConfig.sections[0]?.id || "";

    set({
      attemptId,
      examConfig,
      questions,
      remainingSeconds,
      answers: initialAnswers,
      visitedQuestions: visited,
      currentQuestionIndex: initialQuestionIndex,
      activeSectionId,
      warnings,
      status: "ACTIVE",
      errorMessage: null,
      syncStatus: "SAVED",
      resultId: null,
    });

    // Save initial state to IndexedDB immediately
    saveLocalSession({
      attemptId,
      currentQuestionIndex: initialQuestionIndex,
      activeSectionId,
      answers: initialAnswers,
      visitedQuestions: visited,
      remainingSeconds,
      warnings,
      updatedAt: Date.now(),
    });
  },

  selectOption: (questionId, value, isMulti) => {
    const { answers, attemptId, currentQuestionIndex, activeSectionId, visitedQuestions, remainingSeconds, warnings } = get();
    const currentAns = answers[questionId] || { selected: [], markedForReview: false, timeSpentSeconds: 0 };

    let newSelected: (number | string)[];
    if (isMulti) {
      const exists = currentAns.selected.includes(value);
      newSelected = exists
        ? currentAns.selected.filter((v) => v !== value)
        : [...currentAns.selected, value];
    } else {
      newSelected = [value];
    }

    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...currentAns,
        selected: newSelected,
      },
    };

    set({ answers: updatedAnswers });

    // Local IndexedDB persistence
    if (attemptId) {
      saveLocalSession({
        attemptId,
        currentQuestionIndex,
        activeSectionId,
        answers: updatedAnswers,
        visitedQuestions,
        remainingSeconds,
        warnings,
        updatedAt: Date.now(),
      });
    }

    // Debounce server sync
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      get().syncToServer();
    }, 3000);
  },

  clearResponse: (questionId) => {
    const { answers, attemptId, currentQuestionIndex, activeSectionId, visitedQuestions, remainingSeconds, warnings } = get();
    const currentAns = answers[questionId] || { selected: [], markedForReview: false, timeSpentSeconds: 0 };

    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...currentAns,
        selected: [],
      },
    };

    set({ answers: updatedAnswers });

    if (attemptId) {
      saveLocalSession({
        attemptId,
        currentQuestionIndex,
        activeSectionId,
        answers: updatedAnswers,
        visitedQuestions,
        remainingSeconds,
        warnings,
        updatedAt: Date.now(),
      });
    }

    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      get().syncToServer();
    }, 3000);
  },

  toggleMarkForReview: (questionId) => {
    const { answers, attemptId, currentQuestionIndex, activeSectionId, visitedQuestions, remainingSeconds, warnings } = get();
    const currentAns = answers[questionId] || { selected: [], markedForReview: false, timeSpentSeconds: 0 };

    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...currentAns,
        markedForReview: !currentAns.markedForReview,
      },
    };

    set({ answers: updatedAnswers });

    if (attemptId) {
      saveLocalSession({
        attemptId,
        currentQuestionIndex,
        activeSectionId,
        answers: updatedAnswers,
        visitedQuestions,
        remainingSeconds,
        warnings,
        updatedAt: Date.now(),
      });
    }

    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      get().syncToServer();
    }, 3000);
  },

  navigateToQuestion: (index) => {
    const { questions, visitedQuestions, examConfig } = get();
    if (index < 0 || index >= questions.length) return;

    const q = questions[index];
    const newVisited = visitedQuestions.includes(q.id)
      ? visitedQuestions
      : [...visitedQuestions, q.id];

    // Find section containing this question
    let matchingSectionId = get().activeSectionId;
    if (examConfig) {
      const sec = examConfig.sections.find((s) => s.questionIds.includes(q.id));
      if (sec) matchingSectionId = sec.id;
    }

    set({
      currentQuestionIndex: index,
      visitedQuestions: newVisited,
      activeSectionId: matchingSectionId,
    });
  },

  navigateToNext: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      get().navigateToQuestion(currentQuestionIndex + 1);
    }
  },

  navigateToPrev: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      get().navigateToQuestion(currentQuestionIndex - 1);
    }
  },

  switchSection: (sectionId) => {
    const { examConfig, questions } = get();
    if (!examConfig) return;

    const sec = examConfig.sections.find((s) => s.id === sectionId);
    if (!sec || sec.questionIds.length === 0) return;

    const targetQId = sec.questionIds[0];
    const targetIdx = questions.findIndex((q) => q.id === targetQId);

    if (targetIdx !== -1) {
      get().navigateToQuestion(targetIdx);
    }
    set({ activeSectionId: sectionId });
  },

  tickTimer: () => {
    const { remainingSeconds, status, answers, questions, currentQuestionIndex } = get();
    if (status !== "ACTIVE") return;

    // Increment timeSpent on active question
    const currentQ = questions[currentQuestionIndex];
    let updatedAnswers = answers;
    if (currentQ) {
      const cur = answers[currentQ.id] || { selected: [], markedForReview: false, timeSpentSeconds: 0 };
      updatedAnswers = {
        ...answers,
        [currentQ.id]: {
          ...cur,
          timeSpentSeconds: (cur.timeSpentSeconds || 0) + 1,
        },
      };
    }

    if (remainingSeconds <= 1) {
      set({ remainingSeconds: 0, answers: updatedAnswers });
      get().submitExam(true); // Auto-submit when time expires!
      return;
    }

    set({ remainingSeconds: remainingSeconds - 1, answers: updatedAnswers });
  },

  triggerWarning: (reason) => {
    const { warnings, examConfig } = get();
    const maxStrikes = examConfig?.rules.maxStrikes || 3;
    const newWarnings = warnings + 1;

    set({
      warnings: newWarnings,
      showWarningModal: true,
      warningReason: reason,
    });

    if (newWarnings >= maxStrikes) {
      // Auto-submit immediately if strikes threshold exceeded!
      get().submitExam(true);
    } else {
      get().syncToServer();
    }
  },

  dismissWarning: () => {
    set({ showWarningModal: false, warningReason: "" });
  },

  setShowCalculator: (show) => {
    set({ showCalculator: show });
  },

  setShowSubmitModal: (show) => {
    set({ showSubmitModal: show });
  },

  syncToServer: async () => {
    const { attemptId, answers, visitedQuestions, questions, currentQuestionIndex, warnings, status } = get();
    if (!attemptId || status !== "ACTIVE") return;

    set({ syncStatus: "SAVING" });
    try {
      const res = await fetch(`/api/mock/attempts/${attemptId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          visitedQuestions,
          currentQuestionId: questions[currentQuestionIndex]?.id,
          warningsTriggered: warnings,
        }),
      });

      if (res.ok) {
        set({ syncStatus: "SAVED", lastSavedAt: Date.now() });
      } else {
        set({ syncStatus: "ERROR" });
      }
    } catch {
      set({ syncStatus: "ERROR" });
    }
  },

  submitExam: async (isAutoSubmit = false) => {
    const { attemptId, answers, status } = get();
    if (!attemptId || status === "SUBMITTING" || status === "COMPLETED") return null;

    set({ status: "SUBMITTING", showSubmitModal: false });
    try {
      const res = await fetch(`/api/mock/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          isAutoSubmit,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Clear local storage cache
        await clearLocalSession(attemptId);
        set({ status: "COMPLETED", resultId: data.resultId });
        return data.resultId;
      } else {
        set({ status: "ACTIVE", errorMessage: data.error || "Submission failed" });
        return null;
      }
    } catch (err: any) {
      set({ status: "ACTIVE", errorMessage: err.message || "Network error submitting exam" });
      return null;
    }
  },

  getPaletteStatus: (questionId) => {
    const { answers, visitedQuestions } = get();
    const isVisited = visitedQuestions.includes(questionId);
    const ans = answers[questionId];
    const hasAnswer = ans && ans.selected && ans.selected.length > 0;
    const isMarked = ans && ans.markedForReview;

    if (!isVisited) return "not-visited";
    if (hasAnswer && isMarked) return "answered-marked";
    if (isMarked) return "marked-review";
    if (hasAnswer) return "answered";
    return "not-answered";
  },
}));
