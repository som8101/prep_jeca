import { NextResponse } from "next/server";
import { getAttempt } from "@/app/lib/mock/attemptStore";
import { getExamConfig, getSanitizedQuestionsForExam } from "@/app/lib/mock/questionBank";

export async function GET(
  _req: Request,
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
        { success: false, error: "Associated exam config not found" },
        { status: 404 }
      );
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - attempt.startedAt) / 1000);
    const totalDurationSeconds = attempt.durationMinutes * 60;
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

    const questions = getSanitizedQuestionsForExam(exam);

    return NextResponse.json({
      success: true,
      attempt,
      examConfig: exam,
      questions,
      serverNow: now,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}
