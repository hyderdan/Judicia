import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle2, AlertCircle, User, Calendar, Shield, Gavel } from "lucide-react";
import { cn } from "../../component/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./../../component/ui/dialog";
import { Button } from "./../../component/ui/button";

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
  police_name?: string;
  court_name?: string;
  evidence: Evidence[];
}

export default function CaseReview() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ['courtCases', user.id],
    queryFn: async () => {
      const res = await fetch(`http://127.0.0.1:8000/court/cases/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch cases");
      return res.json();
    },
    enabled: !!user.id
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "rejected": return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "sent_to_court": return <Gavel className="h-5 w-5 text-primary" />;
      default: return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "bg-success/10 text-success border-success/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      case "sent_to_court": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-warning/10 text-warning border-warning/20";
    }
  };

  return (
    <DashboardLayout role="court">
      <PageHeader
        title="Assigned Cases"
        description="Review cases sent to this court for legal processing"
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : cases.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="h-8 w-8 text-primary/40" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
          <p className="text-muted-foreground">Cases assigned to this court by the police will appear here.</p>
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
                      <span className="capitalize">{caseItem.status.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 mb-4">{caseItem.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Complainant: {caseItem.user_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Incident: {caseItem.incident_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Police: {caseItem.police_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Review Evidence</Button>
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
                    <Shield className="h-4 w-4" />
                    Originating Police Station
                  </p>
                  <p className="font-semibold">{selectedCase.police_name}</p>
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
                  Evidence Portfolio ({selectedCase.evidence.length})
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
