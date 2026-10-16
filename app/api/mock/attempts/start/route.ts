import { NextResponse } from "next/server";
import { getExamConfig, getSanitizedQuestionsForExam } from "@/app/lib/mock/questionBank";
import { saveAttempt } from "@/app/lib/mock/attemptStore";
import { AttemptSession } from "@/app/lib/mock/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { examConfigId, userId } = body;

    if (!userId || userId === "anonymous-student") {
      return NextResponse.json(
        { success: false, error: "Authentication required to start a mock exam attempt" },
        { status: 401 }
      );
    }

    if (!examConfigId) {
      return NextResponse.json(
        { success: false, error: "examConfigId is required" },
        { status: 400 }
      );
    }

    const exam = getExamConfig(examConfigId);
    if (!exam) {
      return NextResponse.json(
        { success: false, error: `Exam configuration '${examConfigId}' not found` },
        { status: 404 }
      );
    }

    const now = Date.now();
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const questions = getSanitizedQuestionsForExam(exam);

    const initialSession: AttemptSession = {
      id: attemptId,
      userId,
      examConfigId: exam.id,
      startedAt: now,
      durationMinutes: exam.durationMinutes,
      answers: {},
      visitedQuestions: [questions[0]?.id].filter(Boolean),
      currentQuestionId: questions[0]?.id,
      warningsTriggered: 0,
      status: "IN_PROGRESS",
    };

    saveAttempt(initialSession);

    return NextResponse.json({
      success: true,
      attemptId,
      examConfig: exam,
      questions,
      startedAt: now,
      serverNow: now,
      durationMinutes: exam.durationMinutes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to start attempt" },
      { status: 500 }
    );
  }
}
