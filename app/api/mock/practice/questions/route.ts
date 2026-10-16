import { NextResponse } from "next/server";
import { getPracticeQuestions } from "@/app/lib/mock/questionBank";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject") || undefined;
    const topic = url.searchParams.get("topic") || undefined;
    const limit = Number(url.searchParams.get("limit")) || 10;
    const unseenRaw = url.searchParams.get("unseenIds");
    const unseenIds = unseenRaw ? unseenRaw.split(",") : undefined;

    const data = getPracticeQuestions({
      subject,
      topic,
      limit,
      unseenIds,
    });

    return NextResponse.json({
      success: true,
      questions: data.questions,
      totalAvailable: data.totalAvailable,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch practice questions" },
      { status: 500 }
    );
  }
}
