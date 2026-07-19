"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { localUnreadCount, subscribeMessages } from "@/lib/messages-store";
import { subscribeNotifications, unreadCountFor } from "@/lib/notifications";

/** Live unread counts for the signed-in user: DMs and notifications. */
export function useUnreadCounts(): { messages: number; notifications: number } {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

  useEffect(() => {
    if (!user) {
      setCounts({ messages: 0, notifications: 0 });
      return;
    }
    const recompute = () =>
      setCounts({
        messages: localUnreadCount(user.id),
        notifications: unreadCountFor(user.id),
      });
    recompute();
    const unsubM = subscribeMessages(recompute);
    const unsubN = subscribeNotifications(recompute);
    return () => {
      unsubM();
      unsubN();
    };
  }, [user]);

  return counts;
}
