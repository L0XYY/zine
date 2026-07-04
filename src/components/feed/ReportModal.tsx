"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { REPORT_REASONS } from "@/lib/constants";
import { createReport } from "@/lib/data";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { ReportReason, Video } from "@/lib/types";

export function ReportModal({
  video,
  open,
  onClose,
}: {
  video: Video;
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const { user } = useAuth();
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) return;
    if (!user) {
      toast("Log in to report content.", "info");
      return;
    }
    setSubmitting(true);
    const ok = await createReport(video.id, reason as ReportReason, detail, user.id);
    setSubmitting(false);
    if (!ok) {
      toast("Couldn't submit the report. Try again.", "error");
      return;
    }
    onClose();
    setReason("");
    setDetail("");
    toast("Report received — our mods will take a look.", "success");
  };

  return (
    <Modal open={open} onClose={onClose} title="Report this Zine">
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
          <Flag className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
          <p>
            You&apos;re reporting{" "}
            <span className="font-medium text-white">
              &ldquo;{video.title}&rdquo;
            </span>{" "}
            by @{video.author.username}. Reports are anonymous.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium text-slate-300">
            What&apos;s wrong?
          </legend>
          {REPORT_REASONS.map((r) => (
            <label
              key={r.key}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                reason === r.key
                  ? "border-zine-green/50 bg-zine-green/10 text-white"
                  : "border-white/10 text-slate-300 hover:bg-white/5"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={r.key}
                checked={reason === r.key}
                onChange={() => setReason(r.key)}
                className="accent-zine-green"
              />
              {r.label}
            </label>
          ))}
        </fieldset>

        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value.slice(0, 500))}
          placeholder="Add any details (optional)"
          rows={3}
          className="ring-focus w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500"
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!reason}
            loading={submitting}
            onClick={submit}
          >
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
