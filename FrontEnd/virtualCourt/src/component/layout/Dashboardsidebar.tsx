import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  FileText,
  Upload,
  MessageSquare,
  Brain,
  History,
  User,
  FolderOpen,
  LogOut,
  Scale,
  X,
} from "lucide-react";
import { Button } from "../ui/button";

interface DashboardSidebarProps {
  role: "admin" | "police" | "court" | "user";
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: Building2, label: "Court Management", path: "/admin/courts" },
    { icon: Shield, label: "Police Management", path: "/admin/police" },
  ],
  police: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/police" },
    { icon: FileText, label: "Case Management", path: "/police/cases" },
    { icon: Upload, label: "Evidence Upload", path: "/police/evidence" },
    { icon: MessageSquare, label: "Communication", path: "/police/communication" },
  ],
  court: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/CourtOfficial" },
    { icon: FolderOpen, label: "Case Review", path: "/CourtOfficial/cases" },
    { icon: Brain, label: "AI Analysis", path: "/CourtOfficial/ai-analysis" },
    { icon: History, label: "Evidence History", path: "/CourtOfficial/history" },
  ],
  user: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/user" },
    { icon: User, label: "My Profile", path: "/user/profile" },
    { icon: FileText, label: "File Case", path: "/user/file-case" },
    { icon: FolderOpen, label: "My Cases", path: "/user/cases" },
  ],
};

const roleLabels = {
  admin: "Admin Panel",
  police: "Police Portal",
  court: "Court Portal",
  user: "User Portal",
};

const roleColors = {
  admin: "from-primary to-accent",
  police: "from-blue-500 to-cyan-500",
  court: "from-purple-500 to-pink-500",
  user: "from-green-500 to-emerald-500",
};

export function DashboardSidebar({ role, isOpen, onClose }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = menuItems[role];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar flex flex-col transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:z-30",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo section */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-gradient-to-br", roleColors[role])}>
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground">Virtual Court</h1>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[role]}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-sky-100 hover:text-black",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                    : "text-black hover:text-black"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-black hover:text-black hover:bg-red-100"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
