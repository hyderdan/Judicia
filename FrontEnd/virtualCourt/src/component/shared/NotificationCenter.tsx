import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellDot, Check, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";

interface Notification {
    id: number;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    case_id?: number;
}

export function NotificationCenter() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery<Notification[]>({
        queryKey: ['notifications', user.id],
        queryFn: async () => {
            const res = await fetch(`http://127.0.0.1:8000/user/notifications/${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json();
        },
        enabled: !!user.id && user.role === "user",
        refetchInterval: 30000, // Poll every 30 seconds
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const readMutation = useMutation({
        mutationFn: async (id: number) => {
            await fetch(`http://127.0.0.1:8000/notifications/${id}/read`, {
                method: "PUT",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
        },
    });

    if (user.role !== "user") return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-accent transition-colors group"
            >
                {unreadCount > 0 ? (
                    <BellDot className="h-5 w-5 text-primary animate-bounce-subtle" />
                ) : (
                    <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                )}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-background">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-50 lg:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-2 w-80 max-h-[400px] bg-card border rounded-xl shadow-xl z-[60] overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                                <h3 className="font-semibold text-sm">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-accent rounded-md transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={cn(
                                                "p-3 rounded-lg border transition-all relative group",
                                                notification.is_read
                                                    ? "bg-background opacity-70"
                                                    : "bg-primary/5 border-primary/20 shadow-sm"
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    "mt-1 p-1.5 rounded-full",
                                                    notification.type === "review" ? "bg-blue-500/20 text-blue-500" : "bg-primary/20 text-primary"
                                                )}>
                                                    {notification.type === "review" ? <Clock className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs leading-relaxed text-foreground font-medium">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => readMutation.mutate(notification.id)}
                                                        className="p-1 hover:bg-primary/20 rounded text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.some(n => !n.is_read) && (
                                <div className="p-2 border-t bg-muted/10">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-[10px] h-8"
                                        onClick={() => notifications.filter(n => !n.is_read).forEach(n => readMutation.mutate(n.id))}
                                    >
                                        Mark all as read
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
