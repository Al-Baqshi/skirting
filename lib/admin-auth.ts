import { cookies } from "next/headers"

export async function verifyAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("admin_auth")
    return authCookie?.value === "authenticated"
  } catch {
    return false
  }
}
