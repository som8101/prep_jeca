import {
  ExamConfig,
  Question,
  AnswerItem,
  ExamResult,
  QuestionReview,
  SectionBreakdown,
  SubjectBreakdown,
} from "./schemas";

export interface EvaluationInput {
  attemptId: string;
  userId: string;
  examConfig: ExamConfig;
  questionsMap: Map<string, Question>;
  answers: Record<string, AnswerItem>;
  startedAt: number;
  submittedAt: number;
}

export function evaluateAttempt(input: EvaluationInput): ExamResult {
  const {
    attemptId,
    userId,
    examConfig,
    questionsMap,
    answers,
    startedAt,
    submittedAt,
  } = input;

  const timeTakenSeconds = Math.max(0, Math.round((submittedAt - startedAt) / 1000));
  const reviews: QuestionReview[] = [];

  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let partialCount = 0;
  let attemptedCount = 0;
  let unattemptedCount = 0;

  // Track per-section stats
  const sectionStatsMap = new Map<string, SectionBreakdown>();
  for (const sec of examConfig.sections) {
    sectionStatsMap.set(sec.id, {
      sectionId: sec.id,
      name: sec.name,
      totalQuestions: sec.questionIds.length,
      attempted: 0,
      correct: 0,
      incorrect: 0,
      partial: 0,
      unattempted: 0,
      marksObtained: 0,
      maxMarks: sec.questionIds.length * sec.marksPerQuestion,
      timeSpentSeconds: 0,
    });
  }

  // Track per-subject stats
  const subjectStatsMap = new Map<
    string,
    {
      subject: string;
      totalQuestions: number;
      attempted: number;
      correct: number;
      incorrect: number;
      marksObtained: number;
      maxMarks: number;
    }
  >();

  // Process question by question in exam order
  for (const section of examConfig.sections) {
    const sectionStat = sectionStatsMap.get(section.id)!;

    for (const qId of section.questionIds) {
      const q = questionsMap.get(qId);
      if (!q) continue;

      // Initialize subject stat if needed
      if (!subjectStatsMap.has(q.subject)) {
        subjectStatsMap.set(q.subject, {
          subject: q.subject,
          totalQuestions: 0,
          attempted: 0,
          correct: 0,
          incorrect: 0,
          marksObtained: 0,
          maxMarks: 0,
        });
      }
      const subjectStat = subjectStatsMap.get(q.subject)!;
      subjectStat.totalQuestions++;
      subjectStat.maxMarks += q.marks;

      const userAns = answers[qId];
      const selected = userAns?.selected || [];
      const timeSpent = userAns?.timeSpentSeconds || 0;
      sectionStat.timeSpentSeconds += timeSpent;

      let isAttempted = selected.length > 0;
      let isCorrect = false;
      let isPartial = false;
      let marksAwarded = 0;

      if (!isAttempted) {
        unattemptedCount++;
        sectionStat.unattempted++;
      } else {
        attemptedCount++;
        sectionStat.attempted++;
        subjectStat.attempted++;

        if (q.type === "MCQ_SINGLE") {
          // Category-I: Single choice (+1 / -0.25)
          const chosen = Number(selected[0]);
          const correctIdx = Number(q.answer);

          if (chosen === correctIdx) {
            isCorrect = true;
            marksAwarded = q.marks;
            correctCount++;
            sectionStat.correct++;
            subjectStat.correct++;
          } else {
            isCorrect = false;
            marksAwarded = -Math.abs(q.negativeMarks);
            incorrectCount++;
            sectionStat.incorrect++;
            subjectStat.incorrect++;
          }
        } else if (q.type === "MCQ_MULTI") {
          // Category-II: Multiple choice (+2 / 0 negative / partial marking)
          const correctSet = new Set((q.answer as number[]).map(Number));
          const selectedSet = new Set(selected.map(Number));

          const totalCorrect = correctSet.size;
          let correctSelected = 0;
          let incorrectSelected = 0;

          for (const s of selectedSet) {
            if (correctSet.has(s)) {
              correctSelected++;
            } else {
              incorrectSelected++;
            }
          }

          if (incorrectSelected > 0) {
            // Rule 1: ANY incorrect option chosen => 0 marks (no negative)
            isCorrect = false;
            isPartial = false;
            marksAwarded = 0;
            incorrectCount++;
            sectionStat.incorrect++;
            subjectStat.incorrect++;
          } else if (correctSelected === totalCorrect && selectedSet.size === totalCorrect) {
            // Rule 2: ALL correct and NO incorrect => full marks (+2.0)
            isCorrect = true;
            isPartial = false;
            marksAwarded = q.marks;
            correctCount++;
            sectionStat.correct++;
            subjectStat.correct++;
          } else if (correctSelected > 0) {
            // Rule 3: Subset of correct options and NO incorrect => partial credit: 2 * (marked / total)
            isCorrect = false;
            isPartial = true;
            marksAwarded = Number(((q.marks * correctSelected) / totalCorrect).toFixed(2));
            partialCount++;
            sectionStat.partial++;
            subjectStat.correct++; // counts positively in subject accuracy
          } else {
            // Empty / invalid
            marksAwarded = 0;
          }
        } else if (q.type === "NUMERIC") {
          const userVal = String(selected[0]).trim();
          const targetVal = String(q.answer).trim();
          if (userVal === targetVal) {
            isCorrect = true;
            marksAwarded = q.marks;
            correctCount++;
            sectionStat.correct++;
            subjectStat.correct++;
          } else {
            marksAwarded = -Math.abs(q.negativeMarks);
            incorrectCount++;
            sectionStat.incorrect++;
            subjectStat.incorrect++;
          }
        }
      }

      totalScore += marksAwarded;
      sectionStat.marksObtained += marksAwarded;
      subjectStat.marksObtained += marksAwarded;

      // Strip secret answer from question object for safe review display
      const { answer: _ans, explanation: _exp, ...sanitizedQ } = q;

      reviews.push({
        questionId: q.id,
        question: sanitizedQ,
        userSelected: selected,
        correctAnswer: q.answer,
        isCorrect,
        isPartial,
        marksAwarded,
        maxMarks: q.marks,
        negativeMarks: q.negativeMarks,
        timeSpentSeconds: timeSpent,
        explanation: q.explanation,
      });
    }
  }

  // Round scores to 2 decimal places
  totalScore = Math.max(0, Number(totalScore.toFixed(2)));

  const maxMarks = examConfig.totalMarks;
  const percentage = Number(((totalScore / maxMarks) * 100).toFixed(2));
  const accuracyPercentage =
    attemptedCount > 0
      ? Number((((correctCount + partialCount) / attemptedCount) * 100).toFixed(2))
      : 0;

  const sectionBreakdowns: SectionBreakdown[] = Array.from(sectionStatsMap.values()).map(
    (s) => ({
      ...s,
      marksObtained: Number(s.marksObtained.toFixed(2)),
    })
  );

  const subjectBreakdowns: SubjectBreakdown[] = Array.from(subjectStatsMap.values()).map(
    (s) => ({
      subject: s.subject,
      totalQuestions: s.totalQuestions,
      attempted: s.attempted,
      correct: s.correct,
      incorrect: s.incorrect,
      marksObtained: Number(s.marksObtained.toFixed(2)),
      maxMarks: s.maxMarks,
      accuracyPercentage:
        s.attempted > 0 ? Number(((s.correct / s.attempted) * 100).toFixed(2)) : 0,
    })
  );

  return {
    id: `result-${attemptId}`,
    attemptId,
    userId,
    examConfigId: examConfig.id,
    examTitle: examConfig.title,
    startedAt,
    submittedAt,
    timeTakenSeconds,
    totalScore,
    maxMarks,
    percentage,
    accuracyPercentage,
    totalQuestions: examConfig.totalQuestions,
    attemptedCount,
    correctCount,
    incorrectCount,
    partialCount,
    unattemptedCount,
    sections: sectionBreakdowns,
    subjects: subjectBreakdowns,
    reviews,
  };
}
