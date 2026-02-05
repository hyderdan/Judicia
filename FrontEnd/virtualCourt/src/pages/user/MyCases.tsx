import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle, Building2, Calendar, Trash2, Gavel } from "lucide-react";
import { cn } from "../../component/utils";
import { useToast } from "./../../hooks/use-toast";

interface Evidence {
  id: number;
  file_path: string;
  file_type: string;
}

interface Case {
  id: number;
  title: string;
  description: string;
  incident_date: string;
  status: string;
  police_name: string;
  evidence: Evidence[];
}

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./../../component/ui/dialog";
import { Button } from "./../../component/ui/button";

export default function MyCases() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/user/cases/${caseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete case");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCases', user.id] });
      queryClient.invalidateQueries({ queryKey: ['userStats', user.id] });
      toast({
        title: "Case Deleted",
        description: "Your case and associated evidence have been removed.",
        variant: "destructive",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const handleDelete = (e: React.MouseEvent, caseId: number) => {
    e.stopPropagation(); // Prevent opening the dialog
    if (confirm("Are you sure you want to delete this case? This will permanently remove the case and all attached evidence.")) {
      deleteMutation.mutate(caseId);
    }
  };

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['myCases', user.id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/user/cases/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch cases");
      return res.json();
    },
    enabled: !!user.id
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "resolved": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "rejected": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "sent_to_court": return <Gavel className="h-5 w-5 text-primary" />;
      case "under_review": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-success/10 text-success border-success/20";
      case "resolved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "sent_to_court": return "bg-primary/10 text-primary border-primary/20";
      case "under_review": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <DashboardLayout role="user">
      <PageHeader title="My Cases" description="Track the status of your reported incidents" />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cases found</h3>
          <p className="text-muted-foreground">You haven't filed any cases yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover-lift cursor-pointer"
              onClick={() => setSelectedCase(caseItem)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{caseItem.title}</h3>
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                      getStatusClass(caseItem.status)
                    )}>
                      {getStatusIcon(caseItem.status)}
                      <span className="capitalize">{caseItem.status}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{caseItem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{caseItem.police_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Incident: {caseItem.incident_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{caseItem.evidence.length} Evidence files</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDelete(e, caseItem.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Case Details Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedCase?.title}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                selectedCase ? getStatusClass(selectedCase.status) : ""
              )}>
                {selectedCase ? getStatusIcon(selectedCase.status) : null}
                <span className="capitalize">{selectedCase?.status}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Police Station
                  </p>
                  <p className="font-semibold">{selectedCase.police_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Incident Date
                  </p>
                  <p className="font-semibold">{selectedCase.incident_date}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </p>
                <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Evidence Attachments ({selectedCase.evidence.length})</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCase.evidence.map((ev) => (
                    <div key={ev.id} className="group relative aspect-video rounded-lg overflow-hidden bg-muted border">
                      {ev.file_type === 'image' ? (
                        <img
                          src={`http://127.0.0.1:8000${ev.file_path}`}
                          alt="Evidence"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <video
                          src={`http://127.0.0.1:8000${ev.file_path}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={`http://127.0.0.1:8000${ev.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white text-xs font-medium hover:underline"
                        >
                          View Full
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

