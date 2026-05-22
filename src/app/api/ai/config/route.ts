import { NextResponse } from "next/server";
import { isAgentApiConfigured } from "@/lib/ai/agentapi";
import { config } from "@/lib/config";
import { getDefaultAiMode } from "@/lib/ai/provider";

export async function GET() {
  return NextResponse.json({
    agentApiConfigured: isAgentApiConfigured(),
    defaultMode: getDefaultAiMode(),
    model: config.agentApiModel,
  });
}
