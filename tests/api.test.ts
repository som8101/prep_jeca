import { getAllExamSummaries, getExamConfig, getSanitizedQuestionsForExam, checkPracticeAnswer, getPracticeQuestions } from "../app/lib/mock/questionBank";
import { saveAttempt, getAttempt, updateAttemptProgress, saveExamResult, getExamResult } from "../app/lib/mock/attemptStore";
import { evaluateAttempt } from "../app/lib/mock/scoring";
import { loadAllQuestions } from "../app/lib/mock/questionBank";

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

console.log("Running Mock Engine Backend & API Logic Tests...");

// 1. Verify exam summaries
const exams = getAllExamSummaries();
assert(exams.length === 2, `Expected 2 exams, got ${exams.length}`);
console.log(`✔ Found ${exams.length} exams in registry.`);

// 2. Verify client question sanitization (NO LEAKAGE)
const fullMock = getExamConfig("jeca-2026-full-mock-1")!;
assert(Boolean(fullMock), "Full mock config must exist");
const clientQuestions = getSanitizedQuestionsForExam(fullMock);
assert(clientQuestions.length === 100, `Expected 100 client questions, got ${clientQuestions.length}`);

for (const cq of clientQuestions) {
  assert(!("answer" in cq), `Security breach: question ${cq.id} leaked 'answer'!`);
  assert(!("explanation" in cq), `Security breach: question ${cq.id} leaked 'explanation'!`);
}
console.log("✔ Security verified: 100/100 client questions are strictly sanitized (0 answer leaks).");

// 3. Test attempt lifecycle & autosave
const testAttemptId = `test-run-${Date.now()}`;
saveAttempt({
  id: testAttemptId,
  userId: "student-42",
  examConfigId: fullMock.id,
  startedAt: Date.now() - 60000, // 1 min ago
  durationMinutes: 120,
  answers: {
    "c-001": { selected: [1], markedForReview: false, timeSpentSeconds: 25 },
  },
  visitedQuestions: ["c-001"],
  currentQuestionId: "c-001",
  warningsTriggered: 0,
  status: "IN_PROGRESS",
});

const retrieved = getAttempt(testAttemptId)!;
assert(retrieved.userId === "student-42", "Attempt retrieval failed");
assert(retrieved.answers["c-001"].selected[0] === 1, "Answers not persisted properly");

// Autosave update
updateAttemptProgress(testAttemptId, {
  answers: {
    "c-002": { selected: [1], markedForReview: true, timeSpentSeconds: 30 },
  },
  visitedQuestions: ["c-001", "c-002"],
  warningsTriggered: 1,
});

const updated = getAttempt(testAttemptId)!;
assert(Boolean(updated.answers["c-002"]), "Autosave update failed");
assert(updated.warningsTriggered === 1, "Warnings not updated");
console.log("✔ Attempt persistence and autosave verified.");

// 4. Test submission & scoring
const allQuestionsMap = loadAllQuestions();
const result = evaluateAttempt({
  attemptId: testAttemptId,
  userId: "student-42",
  examConfig: fullMock,
  questionsMap: allQuestionsMap,
  answers: updated.answers,
  startedAt: updated.startedAt,
  submittedAt: Date.now(),
});

saveExamResult(result);
const savedResult = getExamResult(result.id)!;
assert(Boolean(savedResult), "Result persistence failed");
assert(savedResult.attemptId === testAttemptId, "Result attempt linkage mismatch");
console.log(`✔ Submission evaluated: Score = ${savedResult.totalScore}/${savedResult.maxMarks}.`);

// 5. Test practice mode instant check
const practiceCheck = checkPracticeAnswer("c-001", [1]);
assert(practiceCheck?.isCorrect === true, "Practice check failed on correct answer");
const practiceCheckWrong = checkPracticeAnswer("c-001", [0]);
assert(practiceCheckWrong?.isCorrect === false, "Practice check failed on wrong answer");
console.log("✔ Topic-wise practice instant check verified.");

// 6. Test practice question unseen prioritization
const practiceSet = getPracticeQuestions({ subject: "C Programming", unseenIds: ["c-001", "c-002"], limit: 5 });
assert(practiceSet.questions.length === 5, "Practice question batch size mismatch");
assert(!practiceSet.questions.slice(0, 3).some(q => q.id === "c-001"), "Seen question was not filtered out properly");
console.log("✔ Practice unseen question prioritization verified.");

console.log("\x1b[32m\n✨ All Backend & API Logic Tests Passed!\x1b[0m\n");
