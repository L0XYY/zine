import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UploadForm } from "@/components/upload/UploadForm";

export const metadata: Metadata = {
  title: "Upload",
  description: "Upload a 6-second Zine.",
};

export default function UploadPage() {
  return (
    <AppShell rightPanel={false}>
      <RequireAuth>
        <UploadForm />
      </RequireAuth>
    </AppShell>
  );
}
