import { apiRequest } from "../core/api.js";

export function fetchRoute(origin, destination) {
  return apiRequest("/api/route/compute", "POST", {
    origin,
    destination
  });
}