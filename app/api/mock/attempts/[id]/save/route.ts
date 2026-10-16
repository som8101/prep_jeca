import { NextResponse } from "next/server";
import { updateAttemptProgress, getAttempt } from "@/app/lib/mock/attemptStore";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attemptId = params.id;
    const existing = getAttempt(attemptId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: `Attempt '${attemptId}' not found` },
        { status: 404 }
      );
    }

    if (existing.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { success: false, error: "Attempt is already submitted or expired" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { answers, visitedQuestions, currentQuestionId, warningsTriggered } = body;

    const updated = updateAttemptProgress(attemptId, {
      answers,
      visitedQuestions,
      currentQuestionId,
      warningsTriggered,
    });

    return NextResponse.json({
      success: true,
      savedAt: Date.now(),
      warningsTriggered: updated?.warningsTriggered || 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to autosave progress" },
      { status: 500 }
    );
  }
}
