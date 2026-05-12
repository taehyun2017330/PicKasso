import "server-only";

import OpenAI from "openai";

export function getOpenAIBaseURL() {
  const rawBaseURL = (process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE_URL || "").trim();
  if (!rawBaseURL) return "";

  try {
    const url = new URL(rawBaseURL);
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/v1";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return rawBaseURL.replace(/\/$/, "");
  }
}

export function createOpenAIClient() {
  const baseURL = getOpenAIBaseURL();

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    ...(baseURL ? { baseURL } : {})
  });
}
