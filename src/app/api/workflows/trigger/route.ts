import { NextResponse } from "next/server";
import { workflows } from "@workflow/next";

export async function POST(req: Request) {
    try {
        const { keyword } = await req.json();

        // Trigger the workflow we defined in /api/workflows
        // In production, this call is secure and tracked by Vercel
        const { workflowRunId } = await workflows.trigger({
            url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/workflows`,
            workflow: "monitoring",
            payload: { keyword: keyword || "Artificial Intelligence" },
        });

        return NextResponse.json({
            success: true,
            message: "Workflow triggered successfully",
            runId: workflowRunId,
        });
    } catch (error: any) {
        console.error("Workflow trigger failed:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
