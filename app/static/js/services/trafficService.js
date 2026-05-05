import { apiRequest } from "../core/api.js";

export function fetchCctvList(region, roadType) {
  return apiRequest(`/api/traffic/cctv-list?region=${region}&roadType=${roadType}`);
}

export function fetchAiEvents() {
  return apiRequest("/api/traffic/ai-events");
}