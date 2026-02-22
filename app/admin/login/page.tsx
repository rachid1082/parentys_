"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "./loading"

const REDIRECT_URL = "https://v0-parentys-landing-page.vercel.app/auth/callback"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "forgot">("login")
  const router = useRouter()

  useEffect(() => {
    const handleSearchParams = async () => {
      const searchParams = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(new URLSearchParams(window.location.search))
        }, 0)
      })
      const errorParam = searchParams.get("error")
      if (errorParam === "auth_failed") {
        setError("Authentication failed. Please try again.")
      }
    }
    handleSearchParams()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { data: authData, error: authError } = await createClient().auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      const { data: userData, error: userError } = await createClient()
        .from("users")
        .select("role")
        .eq("id", authData.user.id)
        .single()

      if (userError || !userData || userData.role !== "admin") {
        await createClient().auth.signOut()
        setError("Access denied. Admin privileges required.")
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
        redirectTo: REDIRECT_URL,
      })

      if (resetError) {
        setError("Failed to send recovery email. Please try again.")
        setLoading(false)
        return
      }

      setSuccess("Password recovery email sent. Check your inbox.")
      setLoading(false)
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1E6] p-4">
      <Suspense fallback={<Loading />}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img
              src="https://tznhipxlrohslxbrdrnm.supabase.co/storage/v1/object/public/assets/brand/logo/main/Main%20Logo%20Parentys.jpg"
              alt="Parentys"
              className="h-12 mx-auto mb-4"
            />
            <CardTitle className="font-display text-2xl">
              {mode === "login" ? "Admin Login" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {mode === "login" ? "Sign in to access the back office" : "Enter your email to receive a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={mode === "login" ? handleLogin : handleForgotPassword} className="space-y-4">
              {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
              {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">{success}</div>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@parentys.com"
                  required
                />
              </div>
              {mode === "login" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? mode === "login"
                    ? "Signing in..."
                    : "Sending..."
                  : mode === "login"
                    ? "Sign In"
                    : "Send Reset Link"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "forgot" : "login")
                    setError("")
                    setSuccess("")
                  }}
                  className="text-sm text-[#878D73] hover:underline"
                >
                  {mode === "login" ? "Forgot your password?" : "Back to login"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}
