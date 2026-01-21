import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { SafeArea } from "./SafeArea";

export function Layout() {
  return (
    <SafeArea
      className="h-screen w-full bg-background text-foreground font-sans antialiased flex flex-col overflow-hidden"
      bottom={false}
    >
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
      <BottomNav />
    </SafeArea>
  );
}
