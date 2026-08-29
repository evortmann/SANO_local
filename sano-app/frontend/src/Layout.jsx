import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Database, FileText, LogOut, Sparkles } from "lucide-react";
import teamworkLogo from "@/assets/sano-teamwork-logo.png";
import { useAuth } from "@/lib/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    url: createPageUrl("Patients"),
    icon: Users,
  },
  {
    title: "Base de Interações",
    url: createPageUrl("Interactions"),
    icon: Database,
  },
  {
    title: "Gerar Orientação",
    url: createPageUrl("GenerateGuidance"),
    icon: Sparkles,
  },
  {
    title: "Orientações Salvas",
    url: createPageUrl("GuidanceHistory"),
    icon: FileText,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <img
                src={teamworkLogo}
                alt="SANO+ — trabalho em equipa"
                className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-0.5 shadow-lg"
              />
              <div>
                <h2 className="font-heading font-bold text-sidebar-foreground text-lg font-bold">SANO+</h2>
                <p className="text-xs text-sidebar-foreground/80 font-medium">Orientações Nutricionais</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider px-3 py-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-secondary hover:text-primary transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'text-sidebar-foreground'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto border-t border-border pt-3">
              <SidebarGroupContent>
                <div className="mb-2 px-3 text-xs text-sidebar-foreground/80">
                  {user?.full_name || user?.email || "Usuário autenticado"}
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => logout()}
                      className="rounded-xl text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Terminar sessão</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-secondary p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-heading font-bold text-foreground">SANO+</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}