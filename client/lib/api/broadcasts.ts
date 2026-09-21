// lib/api/broadcasts.ts — typed client for the public broadcast settings API.

import { request } from "./client";
import type { BroadcastSettings } from "@/types/broadcast";

/** The current live broadcast configuration (audio medium + video link). */
export async function fetchBroadcastSettings(): Promise<BroadcastSettings> {
  return request<BroadcastSettings>("/broadcasts", {
    serviceName: "broadcast service",
  });
}
