import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { DesktopSidebar } from "@/components/ui/desktop-sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <DesktopSidebar
          userName={session.user.name || session.user.email || "User"}
          userEmail={session.user.email || ""}
        />
        <main className="md:ml-[240px] min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </Providers>
  );
}
