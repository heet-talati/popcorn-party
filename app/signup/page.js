"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/authErrors";
import { Card, CardContent } from "@/components/ui/card";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";

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
      
      // Validate username is provided
      if (!usernameSafe) {
        setError("Username is required");
        setLoading(false);
        return;
      }
      
      // Validate username length
      if (usernameSafe.length < 3) {
        setError("Username must be at least 3 characters");
        setLoading(false);
        return;
      }
      
      if (usernameSafe.length > 20) {
        setError("Username must be 20 characters or less");
        setLoading(false);
        return;
      }
      
      // Validate username format (alphanumeric, underscore, hyphen only)
      if (!/^[a-zA-Z0-9_-]+$/.test(usernameSafe)) {
        setError("Username can only contain letters, numbers, underscores, and hyphens");
        setLoading(false);
        return;
      }
      
      // Check if username already exists
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", usernameSafe)
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        setError("Username is already taken");
        setLoading(false);
        return;
      }
      
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const ref = doc(db, "users", user.uid);

      await setDoc(ref, {
        uid: user.uid,
        email: user.email || "",
        username: usernameSafe,
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
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_\-]+"
              title="Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens"
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