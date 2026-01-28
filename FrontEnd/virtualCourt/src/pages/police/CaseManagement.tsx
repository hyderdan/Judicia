import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle, User, Calendar, Shield, Gavel } from "lucide-react";
import { cn } from "../../component/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./../../component/ui/dialog";
import { Button } from "./../../component/ui/button";
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
  user_name: string;
  court_name?: string;
  evidence: Evidence[];
}

interface Court {
  id: number;
  name: string;
}

export default function CaseManagement() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['policeCases', user.id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/police/cases/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch cases");
      return res.json();
    },
    enabled: !!user.id
  });

  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  const filteredCases = useMemo(() => {
    if (!statusFilter) return cases;
    return cases.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
  }, [cases, statusFilter]);

  const { data: courts = [] } = useQuery<Court[]>({
    queryKey: ['courts'],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/courts`);
      if (!res.ok) throw new Error("Failed to fetch courts");
      return res.json();
    }
  });

  const proceedMutation = useMutation({
    mutationFn: async ({ caseId, courtId }: { caseId: number, courtId: number }) => {
      const formData = new FormData();
      formData.append("court_id", courtId.toString());

      const res = await fetch(`http://127.0.0.1:8000/police/cases/${caseId}/proceed`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to send case to court");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policeCases', user.id] });
      toast({
        title: "Success",
        description: "Case has been successfully sent to the court.",
      });
      setSelectedCase(null);
      setSelectedCourtId("");
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (caseId: number) => {
      const res = await fetch(`http://127.0.0.1:8000/police/cases/${caseId}/review`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error("Failed to mark case as under review");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policeCases', user.id] });
    }
  });

  const handleProceed = () => {
    if (!selectedCase || !selectedCourtId) return;
    proceedMutation.mutate({
      caseId: selectedCase.id,
      courtId: parseInt(selectedCourtId)
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "rejected": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "sent_to_court": return <Gavel className="h-5 w-5 text-primary" />;
      case "under_review": return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "sent_to_court": return "bg-primary/10 text-primary border-primary/20";
      case "under_review": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <DashboardLayout role="police">
      <PageHeader
        title="Case Management"
        description="Monitor and process cases filed by users"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cases found</h3>
          <p className="text-muted-foreground">
            {statusFilter ? `No cases with status "${statusFilter}" found.` : "No users have filed cases to your station yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCases.map((caseItem, index) => (
            <motion.div
              key={caseItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl p-6 hover-lift cursor-pointer"
              onClick={() => {
                setSelectedCase(caseItem);
                if (caseItem.status === "pending") {
                  reviewMutation.mutate(caseItem.id);
                }
              }}
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
                      <span className="capitalize">{caseItem.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{caseItem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Filed by: {caseItem.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Incident: {caseItem.incident_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{caseItem.evidence.length} Evidence files</span>
                    </div>
                    {caseItem.status === "sent_to_court" && (
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Gavel className="h-4 w-4" />
                        <span>Assigned: {caseItem.court_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Review Details</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Case Details Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => { setSelectedCase(null); setSelectedCourtId(""); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {selectedCase?.title}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                selectedCase ? getStatusClass(selectedCase.status) : ""
              )}>
                {selectedCase ? getStatusIcon(selectedCase.status) : null}
                <span className="capitalize">{selectedCase?.status.replace(/_/g, ' ')}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Complainant
                  </p>
                  <p className="font-semibold">{selectedCase.user_name}</p>
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
                  Case Description
                </p>
                <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Evidence Gallery ({selectedCase.evidence.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {selectedCase.evidence.map((ev) => (
                    <div key={ev.id} className="group relative aspect-video rounded-lg overflow-hidden bg-muted border shadow-sm">
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
                          className="text-white text-xs font-medium hover:underline bg-primary/20 px-3 py-1.5 rounded-full backdrop-blur-sm"
                        >
                          View Full
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCase.status === "pending" && (
                <div className="pt-6 border-t border-dashed">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" />
                    Proceed to Court
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Select Court</label>
                      <select
                        className="w-full p-2.5 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={selectedCourtId}
                        onChange={(e) => setSelectedCourtId(e.target.value)}
                      >
                        <option value="">Choose a court for this case...</option>
                        {courts.map(court => (
                          <option key={court.id} value={court.id}>{court.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      className="w-full gradient-primary text-white font-semibold"
                      disabled={!selectedCourtId || proceedMutation.isPending}
                      onClick={handleProceed}
                    >
                      {proceedMutation.isPending ? "Sending to Court..." : "Send Case to Court"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedCase.status === "sent_to_court" && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3">
                  <Gavel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-primary uppercase font-bold tracking-wider">Currently Assigned To</p>
                    <p className="font-semibold text-primary">{selectedCase.court_name}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button variant="ghost" onClick={() => setSelectedCase(null)}>Close Review</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
