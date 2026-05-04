import { apiRequest } from "../core/api.js";

export function fetchCctvList(region) {
  return apiRequest(`/api/traffic/cctv-list?region=${region}`);
}