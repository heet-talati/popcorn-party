"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/authErrors";
import { Card, CardContent } from "@/components/ui/card";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const usernameSafe = (username || "").trim();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const ref = doc(db, "users", user.uid);

      await setDoc(ref, {
        uid: user.uid,
        email: user.email || "",
        username: usernameSafe || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/");
    } 

    catch (error) {
      const message =
        error?.code ? getErrorMessage(error.code) : error.message;
      setError(message);
    }

    finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sign Up</h1>
      <Card>
        <CardContent className="pt-4 space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">

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

            {/* Username Input */}
            <Input
              type="text"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}

            {/* Create account Button */}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="underline">
              Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}