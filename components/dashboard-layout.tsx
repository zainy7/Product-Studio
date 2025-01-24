// components/dashboard-layout.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Lightbulb,
  Hammer,
  Rocket,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { auth } from "../lib/firebase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { ProjectSelector } from "@/components/project/ProjectSelector"

interface DashboardLayoutProps {
  children: React.ReactNode;
  secondaryNav?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  secondaryNav,
}: DashboardLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('navState');
    if (stored !== null) {
      setIsNavOpen(JSON.parse(stored));
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('navState', JSON.stringify(isNavOpen));
    }
  }, [isNavOpen, isMounted]);

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#343541] font-serif">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-[#343541] shadow-lg
          transition-all duration-300 ease-in-out flex flex-col
          ${isNavOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-center border-b border-white/10">
          <Image 
            src="/images/pommon.png" 
            alt="Pommon Logo" 
            width={32} 
            height={32} 
          />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <NavItem
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
            isOpen={isNavOpen}
          >
            Dashboard
          </NavItem>
          <NavItem
            href="/dashboard/research"
            icon={<Lightbulb size={20} />}
            isOpen={isNavOpen}
          >
            Research
          </NavItem>
          <NavItem
            href="/dashboard/build"
            icon={<Hammer size={20} />}
            isOpen={isNavOpen}
          >
            Build
          </NavItem>
          <NavItem
            href="/dashboard/market"
            icon={<Rocket size={20} />}
            isOpen={isNavOpen}
          >
            Market
          </NavItem>
          <div className="my-2 border-t border-white/10" />
          <ProjectSelector className={isNavOpen ? "" : "hidden"} />
        </nav>

        {/* Toggle Button and Logout */}
        <div className="border-t border-white/10">
          {isMounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNav}
              className="w-full text-white hover:bg-white/10 rounded-none py-3"
            >
              {isNavOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </Button>
          )}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 rounded-none px-3 py-2 
              text-white transition-all font-serif
              hover:bg-white/10
              ${isNavOpen ? "" : "justify-center"}
            `}
          >
            <LogOut size={20} />
            {isNavOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isNavOpen ? "ml-64" : "ml-20"}`}
      >
        <main className="flex-1 p-6 text-white">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
  isOpen,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
}) {
  const router = useRouter();
  const isActive = router.pathname === href || 
    (href !== '/dashboard' && router.pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`
        flex items-center space-x-3 rounded-lg px-3 py-2 text-white transition-all
        font-serif
        ${isOpen ? "" : "justify-center"}
        ${isActive 
          ? "bg-white/20 text-white"
          : "hover:bg-white/10"
        }
      `}
    >
      {icon}
      {isOpen && <span>{children}</span>}
    </Link>
  );
}
