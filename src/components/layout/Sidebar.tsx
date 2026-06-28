import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowLeftRight,
  UserCircle,
  Boxes,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Produtos", icon: Package },
  { to: "/categories", label: "Categorias", icon: FolderTree },
  { to: "/stock-movements", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/profile", label: "Perfil", icon: UserCircle },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Overlay mobile */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden",
          open ? "block" : "hidden",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5 text-primary-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">StockControl</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-3 text-xs text-muted-foreground">
          v2.0.0 · Front-end
        </div>
      </aside>
    </>
  );
}
