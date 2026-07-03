import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin",
  description: "Zine moderation and admin tools.",
};

export default function AdminPage() {
  return (
    <AppShell rightPanel={false}>
      <RequireAuth admin>
        <AdminPanel />
      </RequireAuth>
    </AppShell>
  );
}
