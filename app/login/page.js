"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } 
    catch (error) {
      setError(getAuthErrorMessage(error.code));
    } 
    finally {
      setLoading(false);
    }
  }

  function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/invalid-email":
      return "No account found with this email.";

    case "auth/invalid-password":
      return "Incorrect password.";

    case "auth/user-disabled":
      return "Your account has been disabled.";

    default:
      return "Something went wrong. Please try again.";
    }
}

  return (
    <section className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <Card>
        <CardContent className="pt-4 space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">

            {/* Email Input */}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Password Input */}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* Sign In Button */}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Signup Link */}
          <p className="text-sm text-muted-foreground"> Don&apos;t have an account? 
          <a href="/signup" className="underline"> Sign up </a>
          </p>

        </CardContent>
      </Card>
    </section>
  );
}