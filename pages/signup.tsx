// pages/signup.tsx
import { useState } from "react";
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
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Image from "next/image";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Attempting to create user with email:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("User created successfully:", userCredential.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      alert(`An error occurred during signup: ${error.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#343541]">
      {/* Art-inspired side panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#343541]" />

        <div className="relative z-10 h-full w-full p-12 flex flex-col justify-center">
          <div className="text-[#FAF3EB] font-serif">
            <h1 className="text-4xl font-bold mb-4">Let's build your dream.</h1>
            <p className="text-lg opacity-80 max-w-md">
              "Every block of stone has a statue inside it, and it is the task
              of the sculptor to discover it." - Michelangelo
            </p>
          </div>
        </div>
      </div>

      {/* Signup form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur border-0 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold font-serif text-[#343541]">
              Create an account
            </CardTitle>
            <CardDescription className="text-[#343541]/70">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#343541]">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white/50 border-[#343541]/10 focus:border-[#e36857] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#343541]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  required
                  className="bg-white/50 border-[#343541]/10 focus:border-[#e36857] transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#e36857] hover:bg-[#e36857]/90 text-white transition-colors"
              >
                Sign Up
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-2 text-[#343541]/70">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 space-x-4">
                <Button
                  variant="outline"
                  className="w-full bg-white/80 hover:bg-white text-[#343541] border-[#343541]/10"
                >
                  Sign up with Google
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-white/80 hover:bg-white text-[#343541] border-[#343541]/10"
                >
                  Sign up with GitHub
                </Button>
              </div>
            </div>

            <div className="text-center text-sm mt-6 text-[#343541]/70">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#e36857] hover:text-[#e36857]/90 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
