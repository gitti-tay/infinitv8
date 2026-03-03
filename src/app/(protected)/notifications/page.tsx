import { auth } from "@/lib/auth";
import { Header } from "@/components/ui/header";
import { redirect } from "next/navigation";

const notifications = [
  {
    id: "1",
    icon: "payments",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    title: "Monthly Distribution",
    description: "You received a distribution from PTF - Pacific Timber Fund",
    amount: "+$550.00",
    amountColor: "text-green-500",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    icon: "check_circle",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Investment Confirmed",
    description:
      "Your investment in SCN - Solar Clean Network has been confirmed",
    amount: "$2,500.00",
    amountColor: "text-text-primary",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    icon: "verified",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "KYC Approved",
    description:
      "Your identity verification has been approved. You can now invest in projects.",
    amount: null,
    amountColor: null,
    timestamp: "3 days ago",
  },
];

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <>
      <Header title="Notifications" showBack={false} />
      <div className="pt-16 pb-24 px-5">
        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-card-light dark:bg-card-dark rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-800"
            >
              <div className="flex gap-3">
                <div
                  className={`w-11 h-11 flex-shrink-0 rounded-full ${notification.iconBg} flex items-center justify-center`}
                >
                  <span
                    className={`material-icons ${notification.iconColor} text-xl`}
                  >
                    {notification.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm">{notification.title}</h3>
                    {notification.amount && (
                      <span
                        className={`text-sm font-bold flex-shrink-0 ${notification.amountColor}`}
                      >
                        {notification.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs mt-1 leading-relaxed">
                    {notification.description}
                  </p>
                  <p className="text-text-muted text-[10px] mt-2">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
