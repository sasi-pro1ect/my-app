import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const DashboardLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#eff0f2]">
        <AppSidebar />
        <div className="flex-1 flex flex-col relative">
          <header className="h-16 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-md px-6 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-zinc-500 hover:text-zinc-900" />
              <h2 className="text-lg font-semibold tracking-tight text-zinc-800 hidden sm:block">
                Store Console
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-zinc-900">Admin User</span>
                <span className="text-xs text-[#00B523] font-medium">Online</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-[#00B523]/10 border border-[#00B523]/20 flex items-center justify-center text-[#00B523] font-bold text-sm shadow-sm">
                AD
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 lg:p-10">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
