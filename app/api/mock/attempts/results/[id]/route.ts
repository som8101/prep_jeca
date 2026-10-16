import { NextResponse } from "next/server";
import { getExamResult } from "@/app/lib/mock/attemptStore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    // Accept either direct resultId ("result-att-...") or attemptId ("att-...")
    const resultKey = id.startsWith("result-") ? id : `result-${id}`;
    const result = getExamResult(resultKey);

    if (!result) {
      return NextResponse.json(
        { success: false, error: `Result '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load exam result" },
      { status: 500 }
    );
  }
}
