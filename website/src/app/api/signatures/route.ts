import { NextRequest, NextResponse } from "next/server";
import { getDemoSignatureSummary, submitDemoSignature } from "@/lib/signatures/api/demo";
import {
  FETCH_SIGNATURES_ERROR_MESSAGE,
  INVALID_JSON_MESSAGE,
  IS_PRODUCTION,
  SUBMIT_SIGNATURE_ERROR_MESSAGE,
} from "@/lib/signatures/api/config";
import {
  getClientIp,
  hashIp,
  readSignatureRequestBody,
} from "@/lib/signatures/api/request";
import {
  cachedPublicJsonResponse,
  jsonErrorResponse,
  missingSignatureServiceResponse,
  signatureApiErrorResponse,
} from "@/lib/signatures/api/responses";
import {
  fetchSignatureSummary,
  submitSignatureToStore,
} from "@/lib/signatures/api/store";
import { validateSignatureSubmission } from "@/lib/signatures/api/validation";
import { createSupabaseServiceClient } from "@/lib/supabase-service";

export async function GET() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    if (IS_PRODUCTION) return missingSignatureServiceResponse();
    return cachedPublicJsonResponse(getDemoSignatureSummary());
  }

  try {
    return cachedPublicJsonResponse(await fetchSignatureSummary(supabase));
  } catch (error) {
    return signatureApiErrorResponse(
      "Failed to fetch signatures:",
      error,
      FETCH_SIGNATURES_ERROR_MESSAGE,
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const body = await readSignatureRequestBody(request);

  if (!body.ok) {
    return jsonErrorResponse(INVALID_JSON_MESSAGE, 400);
  }

  const validation = validateSignatureSubmission(body.body);
  if (!validation.ok) {
    return jsonErrorResponse(validation.error, validation.status);
  }

  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    if (IS_PRODUCTION) return missingSignatureServiceResponse();
    const demoResult = submitDemoSignature(ip);
    return demoResult.ok
      ? NextResponse.json({ success: true })
      : jsonErrorResponse(demoResult.error, demoResult.status);
  }

  try {
    await submitSignatureToStore(supabase, validation.value, hashIp(ip));
    return NextResponse.json({ success: true });
  } catch (error) {
    return signatureApiErrorResponse(
      "Failed to submit signature:",
      error,
      SUBMIT_SIGNATURE_ERROR_MESSAGE,
    );
  }
}
