import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, MessageSquare, Shield, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "../../component/ui/button";
import { Input } from "../../component/ui/input";
import { Textarea } from "../../component/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../component/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

interface NewsPost {
    id: number;
    title: string;
    content: string;
    image_path?: string;
    created_at: string;
}

export default function NewsManagement() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ title: "", content: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data: posts = [], isLoading } = useQuery<NewsPost[]>({
        queryKey: ['police-news', user.id],
        queryFn: async () => {
            const res = await fetch(`http://127.0.0.1:8000/police/news/${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch news");
            return res.json();
        },
        enabled: !!user.id
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const form = new FormData();
            form.append("police_id", user.id.toString());
            form.append("title", data.title);
            form.append("content", data.content);
            if (selectedFile) {
                form.append("file", selectedFile);
            }

            const res = await fetch("http://127.0.0.1:8000/police/news", {
                method: "POST",
                body: form,
            });
            if (!res.ok) throw new Error("Failed to create post");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['police-news'] });
            setIsOpen(false);
            setFormData({ title: "", content: "" });
            setSelectedFile(null);
            setPreviewUrl(null);
            toast.success("News post created successfully!");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (postId: number) => {
            const res = await fetch(`http://127.0.0.1:8000/police/news/${postId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete post");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['police-news'] });
            toast.success("Post deleted successfully");
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error("Please fill in all fields");
            return;
        }
        createMutation.mutate(formData);
    };

    return (
        <DashboardLayout role="police">
            <div className="flex justify-between items-center mb-8">
                <PageHeader
                    title="News Management"
                    description="Post updates and announcements for the community"
                />

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Announcement</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Post Title</label>
                                <Input
                                    placeholder="e.g., Community Safety Notice"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    placeholder="Write your update here..."
                                    className="min-h-[150px]"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Attach Image (Optional)</label>
                                <div className="flex flex-col gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                    {previewUrl && (
                                        <div className="relative aspect-video rounded-lg overflow-hidden border">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Posting..." : "Post Announcement"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="glass-card rounded-xl p-12 text-center">
                    <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">Start by creating your first community update.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 rounded-xl flex items-start justify-between gap-4"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-bold">{post.title}</h3>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(post.created_at), 'PPP')}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm line-clamp-2">{post.content}</p>
                            </div>

                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this post?")) {
                                        deleteMutation.mutate(post.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
