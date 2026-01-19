import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout() {
  return (
    <div className="h-screen w-full bg-background text-foreground font-sans antialiased flex flex-col pt-safe overflow-hidden">
      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
