import { auth } from "@/lib/auth";
import { Header } from "@/components/ui/header";
import { redirect } from "next/navigation";

function getNotificationIcon(type: string) {
  switch (type) {
    case "investment":
      return { icon: "trending_up", bg: "bg-primary/10", color: "text-primary" };
    case "yield":
      return { icon: "payments", bg: "bg-accent/10", color: "text-accent" };
    case "kyc":
      return { icon: "verified_user", bg: "bg-purple/10", color: "text-purple" };
    case "security":
      return { icon: "security", bg: "bg-amber/10", color: "text-amber" };
    case "system":
      return { icon: "info", bg: "bg-cyan/10", color: "text-cyan" };
    default:
      return { icon: "notifications", bg: "bg-background-tertiary", color: "text-text-muted" };
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SAMPLE_NOTIFICATIONS = [
  {
    id: "n1",
    type: "yield",
    title: "Yield Payout Received",
    message: "You received $18.75 yield payout from BKK-RE01 Bangkok Residence Fund.",
    date: "2026-03-05T08:00:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "investment",
    title: "Investment Confirmed",
    message: "Your $5,000 investment in PHK-AG02 Phuket Agri-Tourism has been confirmed.",
    date: "2026-03-04T14:30:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "security",
    title: "New Sign-In Detected",
    message: "A new sign-in was detected from Chrome on macOS. If this wasn't you, please secure your account.",
    date: "2026-03-03T10:15:00Z",
    read: false,
  },
  {
    id: "n4",
    type: "kyc",
    title: "KYC Verification Update",
    message: "Your Level 2 identity verification is pending review. Average processing time is 15 minutes.",
    date: "2026-03-02T16:45:00Z",
    read: true,
  },
  {
    id: "n5",
    type: "system",
    title: "Platform Maintenance",
    message: "Scheduled maintenance on March 10, 2026 from 02:00-04:00 UTC. Trading will be temporarily paused.",
    date: "2026-03-01T09:00:00Z",
    read: true,
  },
];

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const unreadCount = SAMPLE_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <>
      <Header title="Notifications" showBack={false} />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        {/* Header with Mark All Read */}
        <div className="flex items-center justify-between mt-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Notifications</h3>
            <p className="text-xs text-text-muted">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/15 transition-colors">
              <span className="material-symbols-outlined text-sm">done_all</span>
              Mark All Read
            </button>
          )}
        </div>

        {/* Notification List */}
        {SAMPLE_NOTIFICATIONS.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-background-tertiary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-text-muted">
                notifications_none
              </span>
            </div>
            <h3 className="font-bold text-lg text-text-primary mb-2">No Notifications</h3>
            <p className="text-sm text-text-muted max-w-xs mx-auto">
              You&apos;re all caught up! Notifications about your investments
              and account activity will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden divide-y divide-border">
            {SAMPLE_NOTIFICATIONS.map((notification) => {
              const iconConfig = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-4 hover:bg-card-hover transition-colors ${
                    !notification.read ? "bg-primary/[0.02]" : ""
                  }`}
                >
                  {/* Unread indicator */}
                  <div className="flex-shrink-0 pt-1.5">
                    {!notification.read ? (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <div className="w-2 h-2" />
                    )}
                  </div>

                  {/* Type icon */}
                  <div
                    className={`w-10 h-10 rounded-xl ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <span
                      className={`material-symbols-outlined ${iconConfig.color} text-lg`}
                    >
                      {iconConfig.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`text-sm leading-tight ${
                          !notification.read
                            ? "font-bold text-text-primary"
                            : "font-semibold text-text-secondary"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-[10px] text-text-muted whitespace-nowrap flex-shrink-0">
                        {timeAgo(notification.date)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
