import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Brain, Upload, CheckCircle, XCircle, Loader2, FileVideo, FileImage, AlertCircle } from "lucide-react";
import { useToast } from "./../../hooks/use-toast";

interface Evidence {
  id: number;
  file_path: string;
  file_type: string;
  analysis_status: string;
  is_authentic: boolean | null;
  confidence_score: number | null;
}

interface Case {
  id: number;
  title: string;
  evidence: Evidence[];
}

export default function AIAnalysis() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<number | "">("");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<number | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evidenceDetail, setEvidenceDetail] = useState<Evidence | null>(null);
  const { toast } = useToast();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user.id) {
      fetch(`http://127.0.0.1:8000/court/cases/${user.id}`)
        .then(res => res.json())
        .then(data => setCases(data))
        .catch(err => console.error("Failed to fetch cases:", err));
    }
  }, [user.id]);

  const selectedCase = cases.find(c => c.id === selectedCaseId);
  const evidenceList = selectedCase?.evidence || [];

  const handleAnalyze = async () => {
    if (!selectedEvidenceId) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/evidence/${selectedEvidenceId}/analyze`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error("Analysis request failed");

      toast({ title: "Analysis Started", description: "The AI is processing the evidence in the background." });

      // Start polling for results
      pollAnalysis(Number(selectedEvidenceId));
    } catch (error) {
      toast({ title: "Error", description: "Failed to start analysis", variant: "destructive" });
      setIsAnalyzing(false);
    }
  };

  const pollAnalysis = async (id: number) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/evidence/${id}`);
        const data = await res.json();
        setEvidenceDetail(data);

        if (data.analysis_status === "completed" || data.analysis_status === "failed") {
          clearInterval(interval);
          setIsAnalyzing(false);
          if (data.analysis_status === "completed") {
            toast({ title: "Analysis Complete", description: "Results are now available." });
          }
        }
      } catch (error) {
        clearInterval(interval);
        setIsAnalyzing(false);
      }
    }, 2000);
  };

  return (
    <DashboardLayout role="court">
      <PageHeader title="AI Evidence Analysis" description="Analyze evidence for authenticity using OpenCV & PyTorch" />

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-8 border shadow-lg">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Select Evidence
          </h3>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block text-muted-foreground">Select Case</label>
              <select
                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                value={selectedCaseId}
                onChange={(e) => {
                  setSelectedCaseId(Number(e.target.value));
                  setSelectedEvidenceId("");
                  setEvidenceDetail(null);
                }}
              >
                <option value="">Choose a case...</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>{c.title} (ID: {c.id})</option>
                ))}
              </select>
            </div>

            {selectedCaseId && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <label className="text-sm font-medium mb-2 block text-muted-foreground">Select File</label>
                <select
                  className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={selectedEvidenceId}
                  onChange={(e) => {
                    setSelectedEvidenceId(Number(e.target.value));
                    const ev = evidenceList.find(f => f.id === Number(e.target.value));
                    setEvidenceDetail(ev || null);
                  }}
                >
                  <option value="">Choose evidence file...</option>
                  {evidenceList.map(e => (
                    <option key={e.id} value={e.id}>{e.file_type.toUpperCase()} - {e.file_path.split('/').pop()}</option>
                  ))}
                </select>
              </motion.div>
            )}

            {evidenceDetail && (
              <div className="p-4 rounded-lg bg-muted/50 border flex items-center gap-3">
                {evidenceDetail.file_type === 'video' ? <FileVideo className="text-primary" /> : <FileImage className="text-primary" />}
                <div className="text-sm truncate font-mono">
                  {evidenceDetail.file_path.split('/').pop()}
                </div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedEvidenceId || evidenceDetail?.analysis_status === 'processing'}
              className="w-full gradient-primary text-white h-12 shadow-md hover:shadow-lg transition-all"
            >
              {isAnalyzing || evidenceDetail?.analysis_status === 'processing' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" />Run AI Pipeline</>
              )}
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-8 border shadow-lg min-h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Analysis Results
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center">
            {isAnalyzing || evidenceDetail?.analysis_status === 'processing' ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-24 h-24 rounded-full gradient-primary animate-pulse-glow mb-6 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <p className="text-xl font-medium animate-pulse">Scanning Pixels...</p>
                <p className="text-muted-foreground mt-2">OpenCV extracting frames...</p>
                <p className="text-xs text-muted-foreground/60 mt-1">MTCNN detecting faces & PyTorch classifying</p>
              </div>
            ) : evidenceDetail?.analysis_status === 'completed' ? (
              <div className="text-center w-full">
                <div className={`inline-flex p-6 rounded-full mb-6 ${evidenceDetail.is_authentic ? "bg-success/10" : "bg-destructive/10"}`}>
                  {evidenceDetail.is_authentic ? <CheckCircle className="h-16 w-16 text-success" /> : <XCircle className="h-16 w-16 text-destructive" />}
                </div>
                <h4 className="text-3xl font-bold mb-2">
                  {evidenceDetail.is_authentic ? "Verified Authentic" : "Manipulated / Fake"}
                </h4>
                <div className="mt-6 p-6 rounded-xl border bg-background/50">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">AI Confidence Score</p>
                  <p className="text-5xl font-black text-primary">{evidenceDetail.confidence_score}%</p>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">
                  This result was generated by analyzing {evidenceDetail.file_type} frames for spatial-temporal inconsistencies.
                </p>
              </div>
            ) : evidenceDetail?.analysis_status === 'failed' ? (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
                <p className="text-xl font-bold text-warning">Analysis Failed</p>
                <p className="text-muted-foreground">The AI engine encountered an error or no faces were detected.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground max-w-[200px] mx-auto">Select evidence from the list and click "Run AI Pipeline"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
