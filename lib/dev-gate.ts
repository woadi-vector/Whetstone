import { NextRequest } from "next/server";

export const DEV_GATE_COOKIE_NAME = "whetstone_dev_gate";
export const DEV_GATE_COOKIE_VALUE = "granted";

// TODO(auth): Delete with the temporary DEV_GATE_CODE gate.
export function hasDevGate(request: NextRequest) {
  return request.cookies.get(DEV_GATE_COOKIE_NAME)?.value === DEV_GATE_COOKIE_VALUE;
}
