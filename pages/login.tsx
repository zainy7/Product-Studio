// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to sign in with Google.");
      console.error(error);
    }
  };

  const handleGitHubSignIn = async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      setError("Failed to sign in with GitHub.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#343541] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        <Card className="bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-serif text-[#343541]">
              Welcome back
            </CardTitle>
            <CardDescription className="text-[#343541]/70">
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button
                className="w-full bg-white/80 hover:bg-white text-[#343541] border-[#343541]/10"
                variant="outline"
                onClick={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
              <Button
                className="w-full bg-white/80 hover:bg-white text-[#343541] border-[#343541]/10"
                variant="outline"
                onClick={handleGitHubSignIn}
              >
                Continue with GitHub
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-[#343541]/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/80 px-2 text-[#343541]/70">
                  Or continue with
                </span>
              </div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#343541]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-[#343541]/10 focus:border-[#e36857] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#343541]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-[#343541]/10 focus:border-[#e36857] transition-colors"
                />
              </div>
              {error && (
                <div className="text-[#e36857] text-sm bg-[#e36857]/5 border border-[#e36857]/10 rounded-md p-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#e36857] hover:bg-[#e36857]/90 text-white transition-colors"
              >
                Sign In
              </Button>
            </form>
            <div className="text-center text-sm text-[#343541]/70">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#e36857] hover:text-[#e36857]/90 hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
