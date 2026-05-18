"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { signInAction, signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState = { error: "" };

export function AuthForm() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [signInState, signInFormAction, signInPending] = useActionState(signInAction, initialState);
  const [signUpState, signUpFormAction, signUpPending] = useActionState(signUpAction, initialState);
  const pending = isSignupMode ? signUpPending : signInPending;

  return (
    <Card className="mx-auto w-full max-w-md border-indigo-200">
      <CardHeader>
        <CardTitle>{isSignupMode ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignupMode
            ? "Join Math Master 5U and start climbing the leaderboard."
            : "Sign in to solve today’s riddle."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          action={isSignupMode ? signUpFormAction : signInFormAction}
          className="space-y-4"
        >
          <label className="block space-y-2 text-sm font-medium">
            <span>Email</span>
            <Input
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              placeholder="student@school.edu"
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Password</span>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                placeholder="••••••••"
                autoComplete={isSignupMode ? "new-password" : "current-password"}
                className="pe-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 end-0 flex items-center px-3 text-gray-500 hover:text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Please wait..." : isSignupMode ? "Create account" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsSignupMode((curr) => !curr)}
          >
            {isSignupMode ? "Already have an account? Sign in" : "Need an account? Create one"}
          </Button>
        </form>
        {signInState.error ? (
          <p className="mt-3 text-sm text-red-600">{signInState.error}</p>
        ) : null}
        {isSignupMode && signUpState.error ? (
          <p className="mt-3 text-sm text-primary">{signUpState.error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
