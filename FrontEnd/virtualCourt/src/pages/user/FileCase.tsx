import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "./../../component/layout/Dashboardlayout";
import { PageHeader } from "./../../component/shared/PageHeader";
import { Button } from "./../../component/ui/button";
import { Input } from "./../../component/ui/input";
import { Label } from "./../../component/ui/label";
import { Textarea } from "./../../component/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "./../../hooks/use-toast";
import { Upload, X, Image as ImageIcon, Video, FileText } from "lucide-react";

interface FilePreview {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function FileCase() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    policeId: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);

  // Fetch police stations
  const { data: stations = [], error: stationError } = useQuery({
    queryKey: ['policeStations'],
    queryFn: async () => {
      console.log("[FileCase] Fetching police stations...");
      const res = await fetch('http://127.0.0.1:8000/police-stations');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("[FileCase] Station fetch error:", errData);
        throw new Error(errData.detail || "Failed to fetch stations");
      }
      const data = await res.json();
      console.log("[FileCase] Stations received:", data);
      return data;
    }
  });

  if (stationError) {
    console.error("[FileCase] Query error (stations):", stationError);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'video' as const
    }));
    setSelectedFiles(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const fileMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await fetch('http://127.0.0.1:8000/user/file-case', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error("Failed to file case");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Case Filed", description: "Your case has been submitted successfully." });
      setFormData({ title: "", description: "", date: "", policeId: "" });
      setSelectedFiles([]);
    },
    onError: (error: Error) => {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[FileCase] Submitting case with data:", formData);
    console.log("[FileCase] User context:", user);

    if (!formData.policeId) {
      toast({ title: "Station Required", description: "Please select a police station.", variant: "destructive" });
      return;
    }
    if (selectedFiles.length === 0) {
      toast({ title: "Evidence Required", description: "Please attach at least one image or video.", variant: "destructive" });
      return;
    }

    const fd = new FormData();
    fd.append("user_id", user.id?.toString() || "");
    fd.append("police_id", formData.policeId);
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("incident_date", formData.date);

    selectedFiles.forEach((fp, i) => {
      console.log(`[FileCase] Attaching file ${i}:`, fp.file.name);
      fd.append("files", fp.file);
    });

    console.log("[FileCase] Sending FormData...");
    fileMutation.mutate(fd);
  };



  return (
    <DashboardLayout role="user">
      <PageHeader title="File a Case" description="Submit a new case to police" />
      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="space-y-2">
              <Label>Case Title</Label>
              <Input
                placeholder="Brief title of the incident"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the incident in detail..."
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date of Incident</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Select Police Station</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.policeId}
                onChange={(e) => setFormData({ ...formData, policeId: e.target.value })}
                required
              >
                <option value="">Select a station</option>
                {stations.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.phoneNo})</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <Label className="mb-2 block">Evidence (Images/Videos)</Label>
              <div
                className="border-2 border-dashed border-muted rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Click to upload images or videos for AI analysis
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-white mt-4"
              disabled={fileMutation.isPending}
            >
              {fileMutation.isPending ? "Submitting..." : "Submit Case"}
            </Button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Attached Evidence ({selectedFiles.length})
            </h3>
          </div>

          {selectedFiles.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-muted/30">
              <ImageIcon className="h-12 w-12 opacity-20 mb-2" />
              <p className="text-sm">No evidence attached yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {selectedFiles.map((fp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-video rounded-lg overflow-hidden border bg-black"
                  >
                    {fp.type === 'image' ? (
                      <img src={fp.preview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900">
                        <Video className="h-8 w-8 text-white/50" />
                        <span className="text-[10px] text-white/50 absolute bottom-2">Video File</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-primary uppercase mr-1">Note:</span>
              Your submitted evidence will be automatically analyzed by our AI system
              to detect synthetic content and verify authenticity during the court hearing.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

