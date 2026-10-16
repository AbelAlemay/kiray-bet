import "server-only";
import { cookies } from "next/headers";
import { getRegion, isRegionId, regionCookie } from "./regions";

// The area to show: from the link (?region=…) if given, otherwise the visitor's last
// choice in the area switcher, otherwise Denver. Reads cookies: call inside <Suspense>.
export async function getChosenRegion(param?: string | string[]) {
  const fromLink = Array.isArray(param) ? param[0] : param;
  if (isRegionId(fromLink)) return getRegion(fromLink);
  return getRegion((await cookies()).get(regionCookie)?.value);
}
