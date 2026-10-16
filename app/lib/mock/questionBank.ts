import fs from "fs";
import path from "path";
import { Question, ExamConfig, ClientQuestion } from "./schemas";

const QUESTIONS_DIR = path.join(process.cwd(), "content", "questions");
const EXAMS_DIR = path.join(process.cwd(), "content", "exams");

let cachedQuestions: Map<string, Question> | null = null;
let cachedExams: Map<string, ExamConfig> | null = null;

export function loadAllQuestions(): Map<string, Question> {
  if (cachedQuestions) return cachedQuestions;

  const map = new Map<string, Question>();
  if (!fs.existsSync(QUESTIONS_DIR)) return map;

  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(QUESTIONS_DIR, f), "utf-8");
      const list = JSON.parse(content) as Question[];
      for (const q of list) {
        map.set(q.id, q);
      }
    } catch (err) {
      console.error(`Error loading questions from ${f}:`, err);
    }
  }

  cachedQuestions = map;
  return map;
}

export function loadAllExams(): Map<string, ExamConfig> {
  if (cachedExams) return cachedExams;

  const map = new Map<string, ExamConfig>();
  if (!fs.existsSync(EXAMS_DIR)) return map;

  const files = fs.readdirSync(EXAMS_DIR).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    try {
      const content = fs.readFileSync(path.join(EXAMS_DIR, f), "utf-8");
      const exam = JSON.parse(content) as ExamConfig;
      map.set(exam.id, exam);
    } catch (err) {
      console.error(`Error loading exam from ${f}:`, err);
    }
  }

  cachedExams = map;
  return map;
}

export function getExamConfig(examId: string): ExamConfig | null {
  const exams = loadAllExams();
  return exams.get(examId) || null;
}

export function getAllExamSummaries() {
  const exams = loadAllExams();
  return Array.from(exams.values()).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    durationMinutes: e.durationMinutes,
    totalQuestions: e.totalQuestions,
    totalMarks: e.totalMarks,
    sections: e.sections.map((s) => ({
      id: s.id,
      name: s.name,
      questionCount: s.questionIds.length,
      marksPerQuestion: s.marksPerQuestion,
      negativeMarks: s.negativeMarks,
      type: s.type,
    })),
  }));
}

/**
 * Sanitizes questions for delivery to client.
 * Strictly strips `answer` and `explanation`!
 */
export function sanitizeQuestion(q: Question): ClientQuestion {
  const { answer: _a, explanation: _e, ...rest } = q;
  return rest;
}

export function getSanitizedQuestionsForExam(examConfig: ExamConfig): ClientQuestion[] {
  const allQuestions = loadAllQuestions();
  const list: ClientQuestion[] = [];

  for (const section of examConfig.sections) {
    for (const qId of section.questionIds) {
      const q = allQuestions.get(qId);
      if (q) {
        list.push(sanitizeQuestion(q));
      }
    }
  }

  return list;
}

export function getPracticeQuestions(options: {
  subject?: string;
  topic?: string;
  unseenIds?: string[];
  limit?: number;
}): { questions: ClientQuestion[]; totalAvailable: number } {
  const allQuestions = Array.from(loadAllQuestions().values());
  const unseenSet = new Set(options.unseenIds || []);
  const limit = options.limit || 15;

  let filtered = allQuestions;
  if (options.subject && options.subject !== "All") {
    filtered = filtered.filter((q) => q.subject.toLowerCase() === options.subject!.toLowerCase());
  }
  if (options.topic && options.topic !== "All") {
    filtered = filtered.filter((q) => q.topic.toLowerCase() === options.topic!.toLowerCase());
  }

  const totalAvailable = filtered.length;

  // Prioritize questions not yet seen by the user (similar to CISSP study engine pattern)
  const unseen = filtered.filter((q) => !unseenSet.has(q.id));
  const chosen = unseen.length >= limit ? unseen.slice(0, limit) : [...unseen, ...filtered.filter((q) => unseenSet.has(q.id))].slice(0, limit);

  return {
    questions: chosen.map(sanitizeQuestion),
    totalAvailable,
  };
}

export function checkPracticeAnswer(questionId: string, userSelected: (number | string)[]) {
  const allQuestions = loadAllQuestions();
  const q = allQuestions.get(questionId);
  if (!q) return null;

  let isCorrect = false;
  if (q.type === "MCQ_SINGLE") {
    isCorrect = Number(userSelected[0]) === Number(q.answer);
  } else if (q.type === "MCQ_MULTI") {
    const correctSet = new Set((q.answer as number[]).map(Number));
    const userSet = new Set(userSelected.map(Number));
    isCorrect =
      userSet.size === correctSet.size &&
      Array.from(userSet).every((v) => correctSet.has(v));
  } else if (q.type === "NUMERIC") {
    isCorrect = String(userSelected[0]).trim() === String(q.answer).trim();
  }

  return {
    isCorrect,
    correctAnswer: q.answer,
    explanation: q.explanation,
    marks: q.marks,
  };
}
