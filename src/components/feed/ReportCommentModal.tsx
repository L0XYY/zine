"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { REPORT_REASONS } from "@/lib/constants";
import { reportComment } from "@/lib/data";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import type { ReportReason } from "@/lib/types";

export function ReportCommentModal({
  commentId,
  open,
  onClose,
}: {
  commentId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason || !commentId || !user) return;
    setSubmitting(true);
    const ok = await reportComment(commentId, reason as ReportReason, "", user.id);
    setSubmitting(false);
    if (!ok) {
      toast("Couldn't submit the report. Try again.", "error");
      return;
    }
    setReason("");
    onClose();
    toast("Comment reported — our mods will review it.", "success");
  };

  return (
    <Modal open={open} onClose={onClose} title="Report comment">
      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-300">
          <Flag className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
          <p>Reports are anonymous. What&apos;s wrong with this comment?</p>
        </div>
        <fieldset className="space-y-2">
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
                name="comment-report-reason"
                value={r.key}
                checked={reason === r.key}
                onChange={() => setReason(r.key)}
                className="accent-zine-green"
              />
              {r.label}
            </label>
          ))}
        </fieldset>
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
