import { auth } from "@/lib/auth";
import { Header } from "@/components/ui/header";
import { redirect } from "next/navigation";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <>
      <Header title="Notifications" showBack={false} />
      <div className="pt-16 pb-24 md:pb-8 px-5 animate-fadeIn">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-text-muted">
              notifications_none
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2">No Notifications</h3>
          <p className="text-sm text-text-muted max-w-xs mx-auto">
            You&apos;re all caught up! Notifications about your investments
            and account activity will appear here.
          </p>
        </div>
      </div>
    </>
  );
}
