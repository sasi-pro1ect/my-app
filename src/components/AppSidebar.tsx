import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  ShoppingCart,
  Users,
  BookOpen,
  LogOut,
  Layers,
  Tag,
  ChevronDown,
  Star,
  FileText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Approvals", url: "/dashboard/approvals", icon: CheckSquare },
  { title: "Active Swaps", url: "/dashboard/orders", icon: ShoppingCart },
  { title: "Swap Agents", url: "/dashboard/delivery-boys", icon: Users },
  { title: "App Guide", url: "/dashboard/app-feature-guide", icon: FileText },
];

const inventorySubItems = [
  { title: "Categories", url: "/dashboard/categories", icon: Layers },
  { title: "Brands", url: "/dashboard/brands", icon: Tag },
  { title: "Condition Grades", url: "/dashboard/conditions", icon: Star },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const isInventoryActive = inventorySubItems.some((item) => location.pathname === item.url);
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0 shadow-2xl z-30">
      <SidebarContent className={`bg-[#28AF4B] transition-all ${collapsed ? 'pt-4' : 'pt-6'}`}>
        <SidebarGroup>
          <div className={`flex items-center gap-3.5 transition-all border-b border-white/20 pb-4 ${collapsed ? 'justify-center px-0 mb-6 mx-2' : 'px-6 mb-10'}`}>
            <div className={`shrink-0 flex items-center justify-center bg-white rounded-lg shadow-sm ${collapsed ? 'p-1.5 h-10 w-10' : 'p-1 h-10 w-10'}`}>
              <img src="/favicon.png" alt="Lilo" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-white text-2xl leading-none mb-0.5">
                  Lilo<span className="text-[#00B523] opacity-0">.</span>
                </span>
                <span className="text-white/80 text-[10px] uppercase tracking-widest font-bold">
                  Swap Store
                </span>
              </div>
            )}
          </div>
          <SidebarGroupContent className={collapsed ? 'px-1' : 'px-4'}>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={`h-12 w-full transition-all duration-300 rounded-xl ${isActive
                        ? "bg-white text-[#28AF4B] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] hover:bg-white hover:text-[#28AF4B]"
                        : "text-white/80 hover:bg-black/15 hover:text-white"
                        }`}
                    >
                      <NavLink
                        to={item.url}
                        end
                        className={`flex items-center w-full h-full ${collapsed ? 'justify-center px-0' : 'gap-3.5 px-4'}`}
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? "text-white scale-110" : "text-white/80"} ${collapsed ? 'm-0' : ''}`} />
                        {!collapsed && (
                          <span className={`text-[15px] font-bold tracking-wide flex-1 transition-colors ${isActive ? "text-white" : "text-white font-semibold"}`}>
                            {item.title}
                          </span>
                        )}
                        {!collapsed && isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm ml-auto animate-in zoom-in" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Add Inventory - Collapsible Parent */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Add Inventory"
                  className={`h-12 w-full transition-all duration-300 rounded-xl cursor-pointer ${isInventoryActive
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-black/15 hover:text-white"
                    }`}
                  onClick={() => setInventoryOpen(!inventoryOpen)}
                >
                  <div className={`flex items-center w-full h-full ${collapsed ? 'justify-center px-0' : 'gap-3.5 px-4'}`}>
                    <BookOpen className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isInventoryActive ? "text-white scale-110" : "text-white/80"} ${collapsed ? 'm-0' : ''}`} />
                    {!collapsed && (
                      <>
                        <span className={`text-[15px] font-semibold tracking-wide flex-1 transition-colors text-white`}>
                          Add Inventory
                        </span>
                        <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-300 ${inventoryOpen ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sub-Items */}
              {(inventoryOpen || collapsed) && inventorySubItems.map((sub) => {
                const isSubActive = location.pathname === sub.url;
                return (
                  <SidebarMenuItem key={sub.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isSubActive}
                      tooltip={sub.title}
                      className={`h-10 w-full transition-all duration-300 rounded-xl ${isSubActive
                        ? "bg-white text-[#28AF4B] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] hover:bg-white hover:text-[#28AF4B]"
                        : "text-white/70 hover:bg-black/15 hover:text-white"
                        }`}
                    >
                      <NavLink
                        to={sub.url}
                        end
                        className={`flex items-center w-full h-full ${collapsed ? 'justify-center px-0' : 'gap-3 px-4 pl-8'}`}
                      >
                        <sub.icon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isSubActive ? "text-white scale-110" : "text-white/70"} ${collapsed ? 'm-0' : ''}`} />
                        {!collapsed && (
                          <span className={`text-sm font-semibold tracking-wide flex-1 transition-colors ${isSubActive ? "text-white" : "text-white/80"}`}>
                            {sub.title}
                          </span>
                        )}
                        {!collapsed && isSubActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm ml-auto animate-in zoom-in" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={`bg-[#28AF4B] border-t border-white/20 transition-all ${collapsed ? 'p-2 pb-4' : 'p-5 pb-8'}`}>
        <Button
          variant="ghost"
          className={`w-full text-white/80 hover:bg-red-500 hover:text-white rounded-xl h-12 transition-all group ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut className={`h-5 w-5 transition-transform ${collapsed ? '' : 'mr-3 group-hover:-translate-x-1'}`} />
          {!collapsed && <span className="font-bold text-sm tracking-wide">Secure Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
