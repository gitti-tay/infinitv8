import { BottomNav } from "@/components/ui/bottom-nav";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md mx-auto min-h-dvh bg-bg-light dark:bg-bg-dark">
      {children}
      <BottomNav />
    </div>
  );
}
