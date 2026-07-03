import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Zine account and drop your first 6-second loop.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Grab your username and start looping in seconds."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
