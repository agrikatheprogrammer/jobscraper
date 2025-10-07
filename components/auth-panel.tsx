"use client";

import { useState } from "react";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";

export default function AuthPanel() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-card/80 backdrop-blur rounded-lg shadow-md p-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setMode("login")}
            className={`px-4 py-2 rounded-md ${mode === "login" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-4 py-2 rounded-md ${mode === "signup" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            Sign up
          </button>
        </div>

        <div>
          {mode === "login" ? (
            <LoginForm />
          ) : (
            <SignUpForm />
          )}
        </div>
      </div>
    </div>
  );
}
