import fs from "fs";
import path from "path";
import { AttemptSession, ExamResult, AnswerItem } from "./schemas";

const DATA_DIR = path.join(process.cwd(), ".data", "mock");
const ATTEMPTS_DIR = path.join(DATA_DIR, "attempts");
const RESULTS_DIR = path.join(DATA_DIR, "results");

try {
  fs.mkdirSync(ATTEMPTS_DIR, { recursive: true });
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
} catch {
  // Ignore
}

// In-memory cache for fastest response
const attemptsCache = new Map<string, AttemptSession>();
const resultsCache = new Map<string, ExamResult>();

export function saveAttempt(attempt: AttemptSession): void {
  attemptsCache.set(attempt.id, attempt);
  try {
    const file = path.join(ATTEMPTS_DIR, `${attempt.id}.json`);
    fs.writeFileSync(file, JSON.stringify(attempt, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist attempt to disk:", err);
  }
}

export function getAttempt(id: string): AttemptSession | null {
  if (attemptsCache.has(id)) {
    return attemptsCache.get(id)!;
  }
  try {
    const file = path.join(ATTEMPTS_DIR, `${id}.json`);
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as AttemptSession;
      attemptsCache.set(id, parsed);
      return parsed;
    }
  } catch (err) {
    console.error(`Error reading attempt ${id}:`, err);
  }
  return null;
}

export function updateAttemptProgress(
  id: string,
  updates: {
    answers?: Record<string, AnswerItem>;
    visitedQuestions?: string[];
    currentQuestionId?: string;
    warningsTriggered?: number;
    status?: "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "EXPIRED";
  }
): AttemptSession | null {
  const attempt = getAttempt(id);
  if (!attempt) return null;

  if (updates.answers) {
    attempt.answers = { ...attempt.answers, ...updates.answers };
  }
  if (updates.visitedQuestions) {
    attempt.visitedQuestions = Array.from(
      new Set([...attempt.visitedQuestions, ...updates.visitedQuestions])
    );
  }
  if (updates.currentQuestionId !== undefined) {
    attempt.currentQuestionId = updates.currentQuestionId;
  }
  if (updates.warningsTriggered !== undefined) {
    attempt.warningsTriggered = updates.warningsTriggered;
  }
  if (updates.status) {
    attempt.status = updates.status;
  }

  saveAttempt(attempt);
  return attempt;
}

export function saveExamResult(result: ExamResult): void {
  resultsCache.set(result.id, result);
  try {
    const file = path.join(RESULTS_DIR, `${result.id}.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist result to disk:", err);
  }
}

export function getExamResult(id: string): ExamResult | null {
  if (resultsCache.has(id)) {
    return resultsCache.get(id)!;
  }
  try {
    const file = path.join(RESULTS_DIR, `${id}.json`);
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as ExamResult;
      resultsCache.set(id, parsed);
      return parsed;
    }
  } catch (err) {
    console.error(`Error reading result ${id}:`, err);
  }
  return null;
}

export function listUserResults(userId: string): Array<{
  id: string;
  examTitle: string;
  examConfigId: string;
  totalScore: number;
  maxMarks: number;
  percentage: number;
  accuracyPercentage: number;
  submittedAt: number;
  timeTakenSeconds: number;
}> {
  const list: Array<any> = [];
  try {
    if (fs.existsSync(RESULTS_DIR)) {
      const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        try {
          const res = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), "utf-8")) as ExamResult;
          if (res.userId === userId || userId === "all") {
            list.push({
              id: res.id,
              examTitle: res.examTitle,
              examConfigId: res.examConfigId,
              totalScore: res.totalScore,
              maxMarks: res.maxMarks,
              percentage: res.percentage,
              accuracyPercentage: res.accuracyPercentage,
              submittedAt: res.submittedAt,
              timeTakenSeconds: res.timeTakenSeconds,
            });
          }
        } catch {
          // Ignore bad file
        }
      }
    }
  } catch {
    // Ignore
  }

  return list.sort((a, b) => b.submittedAt - a.submittedAt);
}
