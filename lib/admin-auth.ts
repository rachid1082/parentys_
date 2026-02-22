import { createClient } from "@/lib/supabase"

export async function checkAdminAuth() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, user: null }
  }

  const { data: userData } = await supabase.from("users").select("role, full_name, email").eq("id", user.id).single()

  if (!userData || userData.role !== "admin") {
    return { isAdmin: false, user: null }
  }

  return { isAdmin: true, user: { ...user, ...userData } }
}
