import { NextResponse } from "next/server";
import { getAllExamSummaries } from "@/app/lib/mock/questionBank";
import { listUserResults } from "@/app/lib/mock/attemptStore";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const exams = getAllExamSummaries();
    const history = userId ? listUserResults(userId) : [];

    return NextResponse.json({
      success: true,
      exams,
      history,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load exams" },
      { status: 500 }
    );
  }
}
