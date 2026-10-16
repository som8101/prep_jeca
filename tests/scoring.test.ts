import { evaluateAttempt } from "../app/lib/mock/scoring";
import { ExamConfig, Question, AnswerItem } from "../app/lib/mock/schemas";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log("Running JECA Scoring Engine Unit Tests...");

const mockExamConfig: ExamConfig = {
  id: "test-exam",
  title: "Test Exam",
  category: "FULL_MOCK",
  durationMinutes: 120,
  totalQuestions: 5,
  totalMarks: 7.0,
  sections: [
    {
      id: "sec-1",
      name: "Cat-I",
      questionIds: ["q-cat1-correct", "q-cat1-wrong", "q-cat1-skip"],
      marksPerQuestion: 1.0,
      negativeMarks: 0.25,
      type: "MCQ_SINGLE",
    },
    {
      id: "sec-2",
      name: "Cat-2",
      questionIds: ["q-cat2-full", "q-cat2-partial", "q-cat2-wrong"],
      marksPerQuestion: 2.0,
      negativeMarks: 0.0,
      type: "MCQ_MULTI",
    },
  ],
  rules: {
    shuffleQuestions: false,
    shuffleOptions: false,
    allowCalculator: false,
    maxStrikes: 3,
    autosaveIntervalSeconds: 5,
  },
};

// Update total questions to 6
mockExamConfig.totalQuestions = 6;
mockExamConfig.totalMarks = 9.0;

const questionsMap = new Map<string, Question>([
  [
    "q-cat1-correct",
    {
      id: "q-cat1-correct",
      subject: "C Programming",
      topic: "Pointers",
      difficulty: "EASY",
      type: "MCQ_SINGLE",
      question: "Sample Q1",
      options: ["A", "B", "C", "D"],
      answer: 1,
      marks: 1.0,
      negativeMarks: 0.25,
      explanation: "Expl 1",
    },
  ],
  [
    "q-cat1-wrong",
    {
      id: "q-cat1-wrong",
      subject: "C Programming",
      topic: "Pointers",
      difficulty: "EASY",
      type: "MCQ_SINGLE",
      question: "Sample Q2",
      options: ["A", "B", "C", "D"],
      answer: 0,
      marks: 1.0,
      negativeMarks: 0.25,
      explanation: "Expl 2",
    },
  ],
  [
    "q-cat1-skip",
    {
      id: "q-cat1-skip",
      subject: "C Programming",
      topic: "Pointers",
      difficulty: "EASY",
      type: "MCQ_SINGLE",
      question: "Sample Q3",
      options: ["A", "B", "C", "D"],
      answer: 2,
      marks: 1.0,
      negativeMarks: 0.25,
      explanation: "Expl 3",
    },
  ],
  [
    "q-cat2-full",
    {
      id: "q-cat2-full",
      subject: "OOP",
      topic: "Inheritance",
      difficulty: "HARD",
      type: "MCQ_MULTI",
      question: "Sample Q4",
      options: ["A", "B", "C", "D"],
      answer: [0, 2],
      marks: 2.0,
      negativeMarks: 0.0,
      explanation: "Expl 4",
    },
  ],
  [
    "q-cat2-partial",
    {
      id: "q-cat2-partial",
      subject: "OOP",
      topic: "Inheritance",
      difficulty: "HARD",
      type: "MCQ_MULTI",
      question: "Sample Q5",
      options: ["A", "B", "C", "D"],
      answer: [0, 1, 2], // 3 correct options
      marks: 2.0,
      negativeMarks: 0.0,
      explanation: "Expl 5",
    },
  ],
  [
    "q-cat2-wrong",
    {
      id: "q-cat2-wrong",
      subject: "OOP",
      topic: "Inheritance",
      difficulty: "HARD",
      type: "MCQ_MULTI",
      question: "Sample Q6",
      options: ["A", "B", "C", "D"],
      answer: [0, 2],
      marks: 2.0,
      negativeMarks: 0.0,
      explanation: "Expl 6",
    },
  ],
]);

const userAnswers: Record<string, AnswerItem> = {
  // Cat-1 correct: should get +1.0
  "q-cat1-correct": { selected: [1], markedForReview: false, timeSpentSeconds: 15 },
  // Cat-1 wrong: should get -0.25
  "q-cat1-wrong": { selected: [2], markedForReview: false, timeSpentSeconds: 20 },
  // Cat-1 skip: should get 0.0
  "q-cat1-skip": { selected: [], markedForReview: false, timeSpentSeconds: 5 },

  // Cat-2 full: selected [0, 2] == answer [0, 2] => +2.0
  "q-cat2-full": { selected: [0, 2], markedForReview: false, timeSpentSeconds: 30 },
  // Cat-2 partial: answer is [0, 1, 2]. user marked [0, 2] => 2 * (2 / 3) = 1.33 marks
  "q-cat2-partial": { selected: [0, 2], markedForReview: false, timeSpentSeconds: 40 },
  // Cat-2 wrong: marked [0, 3] where 3 is wrong => 0.0 marks
  "q-cat2-wrong": { selected: [0, 3], markedForReview: false, timeSpentSeconds: 25 },
};

const result = evaluateAttempt({
  attemptId: "test-attempt-1",
  userId: "user-1",
  examConfig: mockExamConfig,
  questionsMap,
  answers: userAnswers,
  startedAt: 1000000,
  submittedAt: 1000000 + 135 * 1000,
});

console.log("Evaluation Results:", {
  totalScore: result.totalScore,
  correctCount: result.correctCount,
  incorrectCount: result.incorrectCount,
  partialCount: result.partialCount,
  unattemptedCount: result.unattemptedCount,
});

// Verification assertions:
// q-cat1-correct: +1.0
// q-cat1-wrong:   -0.25
// q-cat1-skip:     0.0
// q-cat2-full:    +2.0
// q-cat2-partial: +1.33
// q-cat2-wrong:    0.0
// Expected Total = 1.0 - 0.25 + 2.0 + 1.33 + 0 = 4.08
assert(result.correctCount === 2, `Expected 2 full correct, got ${result.correctCount}`);
assert(result.incorrectCount === 2, `Expected 2 incorrect, got ${result.incorrectCount}`);
assert(result.partialCount === 1, `Expected 1 partial, got ${result.partialCount}`);
assert(result.unattemptedCount === 1, `Expected 1 unattempted, got ${result.unattemptedCount}`);
assert(result.totalScore === 4.08, `Expected score 4.08, got ${result.totalScore}`);

console.log("\x1b[32m✔ All Scoring Engine Unit Tests Passed!\x1b[0m");
