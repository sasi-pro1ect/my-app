import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Loader2, Search, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";

interface ConditionGrade {
  id: string;
  code: string;
  description: string;
}

const ConditionGrades = () => {
  const [conditions, setConditions] = useState<ConditionGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editCondition, setEditCondition] = useState<ConditionGrade | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCondition, setDeleteCondition] = useState<ConditionGrade | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchConditions = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosInstance.get(API_URL.CONDITIONS);
      setConditions(Array.isArray(data) ? data : data?.content ? data.content : data?.data || []);
    } catch (err) {
      console.error("Failed to load conditions:", err);
      setError("Failed to load condition grades. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  // --- CREATE ---
  const handleCreate = async () => {
    if (!newCode.trim() || !newDescription.trim()) { toast.error("Code and description are required."); return; }
    setSubmitting(true);
    try {
      await axiosInstance.post(API_URL.ADMIN_CONDITIONS, {
        code: newCode.trim().toUpperCase(),
        description: newDescription.trim(),
      });
      toast.success(`Condition grade "${newCode.trim()}" created successfully!`);
      setNewCode(""); setNewDescription(""); setCreateOpen(false);
      fetchConditions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create condition grade.");
    } finally { setSubmitting(false); }
  };

  // --- EDIT ---
  const openEdit = (condition: ConditionGrade) => {
    setEditCondition(condition);
    setEditCode(condition.code);
    setEditDescription(condition.description || "");
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editCondition || !editCode.trim() || !editDescription.trim()) {
      toast.error("Code and description are required.");
      return;
    }
    setEditSubmitting(true);
    try {
      await axiosInstance.patch(`${API_URL.ADMIN_CONDITIONS}/${editCondition.id}`, {
        code: editCode.trim().toUpperCase(),
        description: editDescription.trim(),
      });
      toast.success(`Condition grade updated successfully!`);
      setEditOpen(false); setEditCondition(null);
      fetchConditions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update condition.");
    } finally { setEditSubmitting(false); }
  };

  // --- DELETE ---
  const handleDelete = async () => {
    if (!deleteCondition) return;
    setDeleteSubmitting(true);
    try {
      const response = await axiosInstance.delete(`${API_URL.ADMIN_CONDITIONS}/${deleteCondition.id}`);
      
      const successMsg = response.data?.message || `Condition grade "${deleteCondition.code}" deleted.`;
      const description = [];
      if (response.data?.updated_rejected_listing_count) {
        description.push(`${response.data.updated_rejected_listing_count} rejected listings updated`);
      }
      
      if (description.length > 0) {
        toast.success(successMsg, { description: description.join(", ") });
      } else {
        toast.success(successMsg);
      }

      setDeleteOpen(false); setDeleteCondition(null);
      fetchConditions();
    } catch (err: any) {
      let errorMessage = "Failed to delete condition grade.";
      const data = err?.response?.data;
      
      if (data?.detail?.message) {
        errorMessage = data.detail.message;
        if (data.detail.listing_status_counts) {
          const counts = Object.entries(data.detail.listing_status_counts)
            .map(([status, count]) => `${status.replace('_', ' ')}: ${count}`)
            .join(", ");
          errorMessage += ` (${counts})`;
        }
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally { setDeleteSubmitting(false); }
  };

  // Filter robustly against missing fields
  const filtered = conditions.filter((c) => {
    const codeMatch = c.code ? c.code.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const descMatch = c.description ? c.description.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return codeMatch || descMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Condition Grades</h1>
            <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm">
              {conditions.length} Available
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Manage the condition grades available for items within the swap store platform.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-3.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#00B523]/15 focus-within:border-[#00B523] focus-within:bg-white group hover:shadow-md">
            <Search className="h-5 w-5 text-zinc-400 mr-4 group-hover:text-[#00B523] transition-colors shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grades..."
              className="bg-transparent border-none outline-none text-zinc-900 font-semibold text-sm w-[130px] sm:w-[180px] placeholder:text-zinc-400 placeholder:font-medium"
            />
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="h-[52px] px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-2xl font-semibold text-sm shadow-md shadow-[#00B523]/20 transition-all active:scale-[0.97] flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Grade
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
            <Card key={key} className="bg-white/60 border-zinc-200/40 shadow-sm rounded-3xl overflow-hidden animate-pulse">
              <div className="p-6 flex items-start gap-4 flex-col">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-14 w-14 bg-zinc-200 rounded-2xl shrink-0"></div>
                  <div className="h-4 w-2/3 bg-zinc-200 rounded-lg"></div>
                </div>
                <div className="w-full h-16 bg-zinc-100 rounded-xl mt-2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] text-sm font-semibold border border-red-100 text-center shadow-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-zinc-100">
            <Star className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">No condition grades found</h3>
          <p className="text-zinc-500 font-medium text-base">
            {searchQuery ? `No grades matching "${searchQuery}".` : "The directory is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((condition) => {
            return (
              <Card key={condition.id} className="bg-white border-zinc-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-[1.5rem] overflow-hidden group flex flex-col">
                <div className="p-6 flex-1 flex flex-col relative">

                  {/* Decorative background accent inside card */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-zinc-50 to-transparent -z-10 rounded-bl-full opacity-50"></div>

                  <div className="flex items-start gap-4 mb-5 relative z-10">
                    <div className="h-14 w-14 rounded-[14px] bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center text-zinc-700 font-black text-xl border border-zinc-200/80 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-500 shrink-0 select-none">
                      {condition.code ? condition.code[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1 mt-1 min-w-0">
                      <p className="font-semibold text-zinc-900 text-lg leading-tight truncate">{condition.code}</p>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-1 block">Swap Standard</span>
                    </div>
                  </div>

                  <div className="flex-1 mb-6 bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100/50 relative z-10 flex items-center">
                    {condition.description ? (
                      <p className="text-[13px] text-zinc-600 line-clamp-3 leading-relaxed font-medium" title={condition.description}>
                        {condition.description}
                      </p>
                    ) : (
                      <p className="text-[13px] text-zinc-400 italic font-medium leading-relaxed">
                        No supplementary details provided.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-2 relative z-10 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(condition)}
                      className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-amber-700 border-amber-200/70 bg-amber-50/30 hover:bg-amber-100 hover:text-amber-800 transition-colors gap-1.5 shadow-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setDeleteCondition(condition); setDeleteOpen(true); }}
                      className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-red-600 border-red-200/70 bg-red-50/30 hover:bg-red-100 hover:text-red-700 transition-colors gap-1.5 shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ===== CREATE MODAL ===== */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
            <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#00B523]/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-[#00B523]" />
              </div>
              Add New Grade
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold text-sm">Grade Code <span className="text-red-500">*</span></Label>
              <Input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))}
                placeholder="e.g. A, B, NEW"
                className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl font-medium focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold text-sm">Description <span className="text-red-500">*</span></Label>
              <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brand new, never used, in original packaging..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl font-medium focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 shadow-sm resize-none" />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3">
            <DialogClose asChild><Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-zinc-200">Cancel</Button></DialogClose>
            <Button onClick={handleCreate} disabled={submitting || !newCode.trim() || !newDescription.trim()} className="rounded-xl h-11 px-6 bg-[#00B523] hover:bg-[#009A1D] text-white font-bold shadow-md shadow-[#00B523]/20 active:scale-[0.97]">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {submitting ? "Creating..." : "Create Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT MODAL ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <DialogHeader className="p-6 pb-4 border-b border-zinc-100 bg-zinc-50/50">
            <DialogTitle className="text-xl font-bold text-zinc-900 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Pencil className="h-5 w-5 text-amber-600" />
              </div>
              Edit Condition Grade
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold text-sm">Grade Code <span className="text-red-500">*</span></Label>
              <Input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))}
                className="bg-zinc-50/50 border-zinc-200 h-12 px-4 rounded-xl font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm uppercase font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-bold text-sm">Description <span className="text-red-500">*</span></Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Updated description..." rows={3} className="bg-zinc-50/50 border-zinc-200 p-4 rounded-xl font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 shadow-sm resize-none" />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t border-zinc-100 bg-zinc-50/30 flex gap-3 sm:gap-3">
            <DialogClose asChild><Button variant="outline" className="rounded-xl h-11 px-5 font-bold border-zinc-200">Cancel</Button></DialogClose>
            <Button onClick={handleEdit} disabled={editSubmitting || !editDescription.trim()} className="rounded-xl h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20 active:scale-[0.97]">
              {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
              {editSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-[1.5rem] p-0 overflow-hidden border-zinc-200/60">
          <div className="p-8 text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <Trash2 className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Grade?</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                Are you sure you want to delete grade <span className="font-semibold text-zinc-700">"{deleteCondition?.code}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 rounded-xl h-11 font-bold border-zinc-200">
                Cancel
              </Button>
              <Button onClick={handleDelete} disabled={deleteSubmitting} className="flex-1 rounded-xl h-11 bg-red-500 hover:bg-red-600 text-white font-bold shadow-md shadow-red-500/20 active:scale-[0.97]">
                {deleteSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                {deleteSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConditionGrades;
