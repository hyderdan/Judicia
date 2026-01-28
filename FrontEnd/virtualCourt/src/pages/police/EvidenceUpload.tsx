import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Upload } from "lucide-react";
export default function EvidenceUpload() {
  return (
    <DashboardLayout role="police">
      <PageHeader title="Evidence Upload" description="Upload case evidence" />
      <div className="glass-card rounded-xl p-8 border-2 border-dashed border-border text-center">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Drag and drop evidence files here</p>
        <Button className="gradient-primary text-white">Select Files</Button>
      </div>
    </DashboardLayout>
  );
}
