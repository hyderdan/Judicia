import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Brain, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ isReal: boolean; confidence: number } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);
    // Simulate API call to your Python backend
    await new Promise((r) => setTimeout(r, 3000));
    setResult({ isReal: Math.random() > 0.3, confidence: 85 + Math.random() * 14 });
    setIsAnalyzing(false);
  };

  return (
    <DashboardLayout role="court">
      <PageHeader title="AI Evidence Analysis" description="Analyze evidence for authenticity" />
      
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-8">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select evidence to analyze</p>
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gradient-primary text-white">
            {isAnalyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Brain className="h-4 w-4 mr-2" />Analyze with AI</>}
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-8">
          <h3 className="text-lg font-semibold mb-4">Analysis Result</h3>
          {isAnalyzing ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full gradient-primary animate-pulse-glow mb-4" />
              <p className="text-muted-foreground">Processing evidence...</p>
            </div>
          ) : result ? (
            <div className="text-center py-4">
              <div className={`inline-flex p-4 rounded-full mb-4 ${result.isReal ? "bg-success/10" : "bg-destructive/10"}`}>
                {result.isReal ? <CheckCircle className="h-12 w-12 text-success" /> : <XCircle className="h-12 w-12 text-destructive" />}
              </div>
              <p className="text-2xl font-bold">{result.isReal ? "Verified Authentic" : "Potentially Fake"}</p>
              <p className="text-muted-foreground">Confidence: {result.confidence.toFixed(1)}%</p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Upload evidence and click analyze</p>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
