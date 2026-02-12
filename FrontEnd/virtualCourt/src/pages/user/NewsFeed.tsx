import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageSquare, Calendar, Shield, Share2, ThumbsUp, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../component/ui/button";

interface NewsPost {
    id: number;
    police_id: number;
    title: string;
    content: string;
    image_path?: string;
    created_at: string;
    police_name: string;
}

export default function NewsFeed() {
    const { data: posts = [], isLoading } = useQuery<NewsPost[]>({
        queryKey: ['news-feed'],
        queryFn: async () => {
            const res = await fetch("http://127.0.0.1:8000/news");
            if (!res.ok) throw new Error("Failed to fetch news");
            return res.json();
        }
    });

    return (
        <DashboardLayout role="user">
            <div className="max-w-4xl mx-auto">
                <PageHeader
                    title="Community News"
                    description="Latest updates and announcements from local police stations"
                />

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-primary/40" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No updates yet</h3>
                        <p className="text-muted-foreground">Check back later for news from your local station.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card rounded-xl overflow-hidden"
                            >
                                {post.image_path && (
                                    <div className="aspect-video w-full overflow-hidden">
                                        <img
                                            src={`http://127.0.0.1:8000${post.image_path}`}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Shield className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">{post.police_name}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(post.created_at), 'PPP')}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                                    <p className="text-muted-foreground mb-6 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-4">
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <ThumbsUp className="h-4 w-4" />
                                                Like
                                            </Button>
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                Comment
                                            </Button>
                                        </div>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Share2 className="h-4 w-4" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
