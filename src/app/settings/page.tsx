import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Edit your Zine profile.",
};

export default function SettingsPage() {
  return (
    <AppShell rightPanel={false}>
      <RequireAuth>
        <SettingsForm />
      </RequireAuth>
    </AppShell>
  );
}
