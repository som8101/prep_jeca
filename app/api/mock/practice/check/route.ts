import { NextResponse } from "next/server";
import { checkPracticeAnswer } from "@/app/lib/mock/questionBank";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, userSelected = [] } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: "questionId is required" },
        { status: 400 }
      );
    }

    const result = checkPracticeAnswer(questionId, userSelected);
    if (!result) {
      return NextResponse.json(
        { success: false, error: `Question '${questionId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to check practice answer" },
      { status: 500 }
    );
  }
}
