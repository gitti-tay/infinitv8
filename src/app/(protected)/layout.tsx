import { BottomNav } from "@/components/ui/bottom-nav";
import { DesktopSidebar } from "@/components/ui/desktop-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-bg-light dark:bg-bg-dark">
      <DesktopSidebar />
      <main className="md:ml-64 min-h-dvh">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
