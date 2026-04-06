import { useState, useCallback } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SponsorButton } from "./SponsorButton";
import { useWorkspaceColors } from "@/hooks/useWorkspaceColors";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { Z_SIDEBAR_OVERLAY, Z_SIDEBAR } from "@/constants/z-index";

export function AppLayout() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 워크스페이스 색상 설정을 CSS 변수로 주입 (priority_colors)
  useWorkspaceColors();

  // WebSocket 실시간 업데이트 — 워크스페이스별 연결
  useWebSocket(workspaceSlug);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isDesktop ? (
        <Sidebar />
      ) : (
        <>
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50"
              style={{ zIndex: Z_SIDEBAR_OVERLAY }}
              onClick={closeSidebar}
            />
          )}
          <div
            className={`fixed inset-y-0 left-0 transform transition-transform duration-200 ease-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            style={{ zIndex: Z_SIDEBAR }}
          >
            <Sidebar onNavigate={closeSidebar} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onMenuClick={!isDesktop ? toggleSidebar : undefined} />
        <main className="flex-1 overflow-hidden bg-background">
          <Outlet />
        </main>
      </div>
      <SponsorButton />
    </div>
  );
}
