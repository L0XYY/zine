import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { MobileNav } from "./MobileNav";
import { MobileTopBar } from "./MobileTopBar";

/**
 * The app chrome used by every signed-in page:
 * left sidebar (desktop) · center content · right trending panel (wide desktop)
 * with a mobile top bar + bottom tab bar on small screens.
 */
export function AppShell({
  children,
  rightPanel = true,
  mobileTopBar = true,
  transparentTopBar = false,
  contentClassName,
  bleed = false,
}: {
  children: React.ReactNode;
  rightPanel?: boolean;
  mobileTopBar?: boolean;
  transparentTopBar?: boolean;
  contentClassName?: string;
  /** Remove default content padding (used by the immersive feed). */
  bleed?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1600px]">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {mobileTopBar && <MobileTopBar transparent={transparentTopBar} />}
        <main
          className={cn(
            "min-w-0 flex-1",
            !bleed && "px-4 pb-28 pt-4 sm:px-6 lg:pb-10 lg:pt-8",
            contentClassName,
          )}
        >
          {children}
        </main>
      </div>

      {rightPanel && <RightPanel />}
      <MobileNav />
    </div>
  );
}
