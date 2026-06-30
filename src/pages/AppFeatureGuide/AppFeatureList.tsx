import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Loader2, LayoutTemplate, Trash2, Edit2 } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionFormValues } from "./schema";

export default function AppFeatureList() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<SectionFormValues[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; label: string } | null>(null);

  const fetchSections = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_URL.APP_FEATURE_GUIDE);
      const data = response.data?.data || response.data;
      setSections(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error("Failed to fetch config list");
      }
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleAddCommonMedia = () => {
    if (sections.some(s => s.section_key === "common_media")) {
      toast.error("Common Media section already exists");
      return;
    }
    navigate("/dashboard/app-feature-guide/create-common");
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    setIsDeleting(sectionToDelete.id);
    try {
      await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?section_id=${sectionToDelete.id}`);
      toast.success("Section deleted successfully");
      setSectionToDelete(null);
      fetchSections();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete section");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">App Feature Guide</h1>
          <p className="text-sm text-zinc-500">Manage all App Config sections.</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleAddCommonMedia}
            disabled={sections.some(s => s.section_key === "common_media")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Common Media
          </Button>

          <Button className="bg-[#28AF4B] hover:bg-[#28AF4B]/90 text-white shadow-sm" onClick={() => navigate("/dashboard/app-feature-guide/create")}>
            <Plus className="h-4 w-4 mr-2" /> Create New Config
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-8 w-8 text-[#28AF4B] animate-spin" />
          </div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <LayoutTemplate className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
            <p>No app feature configurations found.</p>
            <div className="flex gap-4 justify-center mt-4">
               <Button onClick={() => navigate("/dashboard/app-feature-guide/create")} className="bg-[#28AF4B] hover:bg-[#28AF4B]/90 text-white">
                 Create your first one
               </Button>
               <Button variant="outline" onClick={handleAddCommonMedia}>
                 Add Common Media
               </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow>
                <TableHead>Section Key</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow
                  key={String(section.section_id ?? section.section_key)}
                  className="hover:bg-zinc-50/50 group cursor-pointer"
                  onClick={() => {
                    if (!section.section_id) {
                      toast.error("Missing section_id for this section");
                      return;
                    }
                    navigate(`/dashboard/app-feature-guide/${section.section_id}`);
                  }}
                >
                  <TableCell className="font-medium text-zinc-900">{section.section_key}</TableCell>
                  <TableCell className="text-zinc-500">{section.title || "—"}</TableCell>
                  <TableCell>
                    {section.section_key === "common_media" ? (
                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Common Media</span>
                    ) : (
                       <span className="inline-flex items-center px-2 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">Standard Section</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 mr-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!section.section_id) {
                          toast.error("Missing section_id for this section");
                          return;
                        }
                        setSectionToDelete({ id: String(section.section_id), label: section.section_key });
                      }}
                      disabled={isDeleting === String(section.section_id)}
                    >
                      {isDeleting === String(section.section_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors mr-2" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!section.section_id) {
                          toast.error("Missing section_id for this section");
                          return;
                        }
                        navigate(`/dashboard/app-feature-guide/${section.section_id}?edit=true`); 
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-500 hover:text-[#28AF4B] hover:bg-[#28AF4B]/10 transition-colors" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!section.section_id) {
                          toast.error("Missing section_id for this section");
                          return;
                        }
                        navigate(`/dashboard/app-feature-guide/${section.section_id}`); 
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Configuration?</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-zinc-500">
            Are you sure you want to delete the configuration{" "}
            <span className="font-semibold text-zinc-900">"{sectionToDelete?.label}"</span>? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setSectionToDelete(null)} disabled={!!isDeleting}>
              Cancel
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDeleteSection}
              disabled={!!isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
