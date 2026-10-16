import { NextResponse } from "next/server";
import { getAttempt, updateAttemptProgress, saveExamResult } from "@/app/lib/mock/attemptStore";
import { getExamConfig, loadAllQuestions } from "@/app/lib/mock/questionBank";
import { evaluateAttempt } from "@/app/lib/mock/scoring";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attemptId = params.id;
    const attempt = getAttempt(attemptId);

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: `Attempt '${attemptId}' not found` },
        { status: 404 }
      );
    }

    const exam = getExamConfig(attempt.examConfigId);
    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam configuration not found" },
        { status: 404 }
      );
    }

    // Parse optional final answer payload sent on submit
    let finalAnswers = attempt.answers;
    try {
      const body = await req.json();
      if (body.answers) {
        finalAnswers = { ...finalAnswers, ...body.answers };
      }
      if (body.isAutoSubmit) {
        attempt.status = "AUTO_SUBMITTED";
      } else {
        attempt.status = "SUBMITTED";
      }
    } catch {
      attempt.status = "SUBMITTED";
    }

    // Check if evaluation already exists
    const submittedAt = Date.now();
    const questionsMap = loadAllQuestions();

    const evaluationResult = evaluateAttempt({
      attemptId,
      userId: attempt.userId,
      examConfig: exam,
      questionsMap,
      answers: finalAnswers,
      startedAt: attempt.startedAt,
      submittedAt,
    });

    // Save final result and update attempt state
    saveExamResult(evaluationResult);
    updateAttemptProgress(attemptId, {
      answers: finalAnswers,
      status: attempt.status,
    });

    return NextResponse.json({
      success: true,
      resultId: evaluationResult.id,
      totalScore: evaluationResult.totalScore,
      maxMarks: evaluationResult.maxMarks,
      percentage: evaluationResult.percentage,
      accuracyPercentage: evaluationResult.accuracyPercentage,
      correctCount: evaluationResult.correctCount,
      incorrectCount: evaluationResult.incorrectCount,
      unattemptedCount: evaluationResult.unattemptedCount,
      timeTakenSeconds: evaluationResult.timeTakenSeconds,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit exam" },
      { status: 500 }
    );
  }
}
