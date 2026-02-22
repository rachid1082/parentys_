import { Navbar } from "@/components/navbar"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { ExpertDetailClient } from "@/components/experts/ExpertDetailClient"
import { notFound } from "next/navigation"

interface ExpertDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ExpertDetailPage({ params }: ExpertDetailPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  // Fetch expert with user data
  const { data: expert, error: expertError } = await supabase
    .from("experts")
    .select(`
      id,
      user_id,
      headline,
      bio,
      categories,
      status,
      avatar_url,
      headline_en,
      headline_fr,
      headline_ar,
      bio_en,
      bio_fr,
      bio_ar,
      created_at,
      updated_at
    `)
    .eq("id", id)
    .single()

  if (expertError || !expert) {
    notFound()
  }

  // Fetch user data for full_name
  const { data: user } = await supabase
    .from("users")
    .select("full_name, email, locale")
    .eq("id", expert.user_id)
    .single()

  // Fetch categories for labels
  const { data: categoriesData } = await supabase.from("categories").select("slug, label, label_en, label_fr, label_ar")

  // Fetch published workshops by this expert
  const { data: workshops } = await supabase
    .from("workshops")
    .select(`
      id,
      title,
      title_en,
      title_fr,
      title_ar,
      banner_url,
      starts_at,
      status
    `)
    .eq("expert_id", expert.id)
    .eq("status", "published")
    .order("starts_at", { ascending: true })

  return (
    <>
      <Navbar />
      <ExpertDetailClient expert={expert} user={user} categories={categoriesData || []} workshops={workshops || []} />
    </>
  )
}
