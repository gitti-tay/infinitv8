import { DesktopSidebar } from "@/components/ui/desktop-sidebar";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
