import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "jeca_prep_cbt_db";
const DB_VERSION = 1;
const STORE_SESSIONS = "exam_sessions";
const STORE_PRACTICE = "practice_seen";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is only available in browser"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: "attemptId" });
        }
        if (!db.objectStoreNames.contains(STORE_PRACTICE)) {
          db.createObjectStore(STORE_PRACTICE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export interface CachedExamState {
  attemptId: string;
  currentQuestionIndex: number;
  activeSectionId: string;
  answers: Record<string, { selected: (number | string)[]; markedForReview: boolean; timeSpentSeconds: number }>;
  visitedQuestions: string[];
  remainingSeconds: number;
  warnings: number;
  updatedAt: number;
}

export async function saveLocalSession(state: CachedExamState): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_SESSIONS, state);
  } catch {
    // LocalStorage fallback
    try {
      localStorage.setItem(`jeca_cbt_${state.attemptId}`, JSON.stringify(state));
    } catch {
      // Storage unavailable
    }
  }
}

export async function getLocalSession(attemptId: string): Promise<CachedExamState | null> {
  try {
    const db = await getDB();
    const data = await db.get(STORE_SESSIONS, attemptId);
    if (data) return data;
  } catch {
    // Try localStorage fallback
  }

  try {
    const raw = localStorage.getItem(`jeca_cbt_${attemptId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export async function clearLocalSession(attemptId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete(STORE_SESSIONS, attemptId);
  } catch {
    // Ignore
  }
  try {
    localStorage.removeItem(`jeca_cbt_${attemptId}`);
  } catch {
    // Ignore
  }
}

export async function markPracticeQuestionSeen(questionId: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_PRACTICE, { id: questionId, seenAt: Date.now() });
  } catch {
    try {
      const seen = JSON.parse(localStorage.getItem("jeca_practice_seen") || "[]");
      if (!seen.includes(questionId)) {
        seen.push(questionId);
        localStorage.setItem("jeca_practice_seen", JSON.stringify(seen));
      }
    } catch {
      // Ignore
    }
  }
}

export async function getSeenPracticeQuestionIds(): Promise<string[]> {
  try {
    const db = await getDB();
    const all = await db.getAll(STORE_PRACTICE);
    return all.map((item) => item.id);
  } catch {
    try {
      return JSON.parse(localStorage.getItem("jeca_practice_seen") || "[]");
    } catch {
      return [];
    }
  }
}
