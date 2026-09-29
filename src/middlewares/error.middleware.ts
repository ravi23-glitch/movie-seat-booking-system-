import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";

export function handleError(error: unknown) {
  console.error("[ErrorHandler]", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const formattedIssues = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: formattedIssues,
      },
      { status: 400 }
    );
  }

  const err = error as any;
  if (err?.code === "P2002") {
    return NextResponse.json(
      {
        success: false,
        error: "Unique constraint violation",
        details: err.meta,
      },
      { status: 409 }
    );
  }

  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}
