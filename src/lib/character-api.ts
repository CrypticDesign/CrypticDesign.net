import { NextResponse } from "next/server";
import { CharacterStoreError } from "./character-store";

export function characterErrorResponse(error: unknown) {
  if (error instanceof SyntaxError) return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  if (error instanceof CharacterStoreError) {
    const status = error.code === "conflict" ? 409 : error.code === "not_found" ? 404 : 422;
    return NextResponse.json({ error: error.message }, { status });
  }
  if (error instanceof Error && /Character|Unknown|Handle|Portrait|visibility|presence|consent|bio|affiliation/.test(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  return NextResponse.json({ error: "Character request could not be completed" }, { status: 500 });
}
