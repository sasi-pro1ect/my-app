import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, ChevronDown, Image as ImageIcon, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, X, Edit3, Flag, Maximize2 } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { toast } from "sonner";

interface ModerationItem {
  listing_id: string;
  status: string;
  reason_codes: string[];
  created_at: string;
  title: string;
  description: string;
  media: string[];
  report_count?: number;
  report_reason?: string[];
  is_edited?: boolean;
  edited_at?: string | null;
}

const OptimizedImage = ({ src, alt, className }: { src?: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (error || !src) {
    return (
      <div className={`bg-zinc-50 shrink-0 flex flex-col items-center justify-center text-zinc-400 animate-in fade-in duration-500 overflow-hidden ${className}`}>
        <ImageIcon className="h-1/3 w-1/3 opacity-20" />
        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-40">No Image</span>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true); }}
        className={`relative shrink-0 overflow-hidden bg-zinc-100 cursor-pointer group/img ${className}`}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <Maximize2 className="h-4 w-4 text-white scale-75 group-hover/img:scale-100 transition-transform duration-300" />
        </div>

        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>

      <ImageViewerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        src={src}
        alt={alt}
      />
    </>
  );
};

const ApprovalRow = ({ item, onActionSuccess }: { item: ModerationItem; onActionSuccess?: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);

  const handleApproveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApproveConfirmOpen(true);
  };

  const handleApproveConfirm = async () => {
    setIsApproving(true);
    try {
      // @ts-ignore dynamic injection
      if (typeof API_URL.APPROVE_MODERATION !== 'function') return;
      // @ts-ignore
      await axiosInstance.post(API_URL.APPROVE_MODERATION(item.listing_id));
      toast.success("Listing manually approved");
      setIsApproveConfirmOpen(false);
      if (onActionSuccess) onActionSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to approve listing.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      if (typeof API_URL.REJECT_LISTING !== 'function') return;
      await axiosInstance.post(API_URL.REJECT_LISTING(item.listing_id));
      toast.success("Listing rejected successfully");
      setIsConfirmOpen(false);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      console.error("Failed to reject listing:", err);
      toast.error("Failed to reject listing. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };
  const dateStr = item?.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  }) : "N/A";

  const editDateStr = item?.is_edited && item?.edited_at ? new Date(item.edited_at).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
  }) : null;

  return (
    <Card className={`bg-white border-zinc-200/60 shadow-sm transition-all rounded-2xl overflow-hidden mb-4 ${expanded ? "ring-2 ring-zinc-100" : "hover:shadow-md hover:border-zinc-300/80"}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 cursor-pointer hover:bg-zinc-50/50 transition-colors"
      >
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold text-zinc-900 leading-tight">{item?.title}</p>
            <Badge className={`px-2.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider ${item?.status === 'approved' ? 'bg-[#00B523]/10 text-[#009A1D] border-none' :
              item?.status === 'rejected' ? 'bg-red-50 text-red-600 border-none' :
                'bg-amber-50 text-amber-600 border-none'
              }`}>
              {item?.status}
            </Badge>
            {(item?.report_count ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100/60 text-red-600 text-[10px] font-bold uppercase tracking-tight shadow-sm">
                <Flag className="h-3 w-3" />
                {item.report_count} {item.report_count === 1 ? 'REPORT' : 'REPORTS'}
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-zinc-500 line-clamp-1 max-w-2xl">{item?.description}</p>
        </div>
        <div className="flex items-center gap-4 sm:shrink-0 mt-2 sm:mt-0">
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-zinc-400">{dateStr}</span>
            {item?.is_edited && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-tight">
                <Edit3 className="h-3 w-3" />
                Edited {editDateStr && `• ${editDateStr}`}
              </div>
            )}
          </div>
          <div className={`p-1.5 rounded-full transition-transform duration-300 ${expanded ? "rotate-180 bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-400"}`}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {expanded && (
        <CardContent className="px-0 pb-0 border-t border-zinc-100 bg-zinc-50/20 animate-in slide-in-from-top-2 mt-0">
          <div className="p-6 space-y-8">

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Reasons & Reports */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                  <h4 className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                    <AlertCircle className="h-3.5 w-3.5" />
                    System Flags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {item?.reason_codes && item?.reason_codes.length > 0 ? (
                      item?.reason_codes.map((code, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-zinc-100 border-none text-zinc-600 font-semibold px-3 py-1 text-[11px] rounded-lg">
                          {code.replace(/_/g, ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 italic">No system flags detected.</span>
                    )}
                  </div>
                </div>

                {/* Reports Section */}
                {(item?.status === 'approved' || item?.status === 'rejected') && (item?.report_count ?? 0) > 0 && (
                  <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100/50">
                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-4">
                      <Flag className="h-3.5 w-3.5" />
                      User Moderation Reports
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.report_reason && item.report_reason.length > 0 ? (
                        item.report_reason.map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white border-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-lg">
                            {reason.replace(/_/g, ' ')}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-red-400 italic font-medium">No details provided.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Media */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">
                  <ImageIcon className="h-3.5 w-3.5" />
                  Visual Proof ({item?.media?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {item?.media && item?.media.length > 0 ? (
                    item?.media.map((url, idx) => (
                      <div key={idx} className="block overflow-hidden rounded-xl border border-zinc-100 transition-all hover:ring-2 hover:ring-[#00B523]/20 bg-zinc-50 relative group">
                        <OptimizedImage
                          src={url}
                          alt={`Media ${idx}`}
                          className="h-24 w-24 object-center"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium py-4">
                      <ImageIcon className="h-4 w-4 opacity-30" />
                      No media available
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* New Action Bar */}
          <div className="bg-zinc-100/50 px-6 py-4 flex items-center justify-between border-t border-zinc-200/60">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <span className="h-1.5  rounded-full bg-zinc-300 animate-pulse" />
              Listing ID: {item.listing_id}
            </div>

            {item?.status === 'approved' && (
              <Button
                variant="destructive"
                disabled={isRejecting}
                onClick={(e) => { e.stopPropagation(); setIsConfirmOpen(true); }}
                className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all shadow-lg shadow-red-500/10 active:scale-95 flex items-center gap-2.5"
              >
                <XCircle className="h-4 w-4" />
                Revoke Approval
              </Button>
            )}

            {item?.status === 'draft' && (
              <Button
                variant="ghost"
                disabled={isApproving}
                onClick={handleApproveClick}
                className="h-9 px-4 text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-700 active:bg-[#00B523]/10 active:text-[#00B523] rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-none flex items-center gap-2"
              >
                {isApproving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Manual Approve
              </Button>
            )}
          </div>
        </CardContent>
      )}

      {/* Rejection Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none p-0 overflow-hidden bg-white shadow-2xl">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">Revoke Approval?</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium leading-relaxed mt-2">
                This action will immediately remove <span className="text-zinc-900 font-bold">"{item.title}"</span> from the store and move it to the rejected queue.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-6 bg-zinc-50 flex flex-row gap-3 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 h-12 rounded-xl text-zinc-500 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200/50 hover:text-zinc-900"
            >
              No, Keep It
            </Button>
            <Button
              disabled={isRejecting}
              onClick={handleReject}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Modal */}
      <Dialog open={isApproveConfirmOpen} onOpenChange={setIsApproveConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border-none p-0 overflow-hidden bg-white shadow-2xl">
          <div className="bg-[#00B523]/10 p-6 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#00B523]/20">
              <CheckCircle2 className="h-8 w-8 text-[#00B523]" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-zinc-900">Manually Approve?</DialogTitle>
              <DialogDescription className="text-zinc-500 font-medium leading-relaxed mt-2">
                Normal approval is automated. Are you sure you want to override the system and approve <span className="text-zinc-900 font-bold">"{item.title}"</span>?
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="p-6 bg-zinc-50 flex flex-row gap-3 sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setIsApproveConfirmOpen(false)}
              className="flex-1 h-12 rounded-xl text-zinc-500 font-bold text-xs uppercase tracking-widest hover:bg-zinc-200/50 hover:text-zinc-900"
            >
              Cancel
            </Button>
            <Button
              disabled={isApproving}
              onClick={handleApproveConfirm}
              className="flex-1 h-12 rounded-xl bg-[#00B523] hover:bg-[#009A1D] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#00B523]/20 transition-all active:scale-95"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Yes, Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Approvals = () => {
  const [activeTab, setActiveTab] = useState("draft");
  const [data, setData] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const observerTarget = useRef(null);

  const fetchData = async (status: string, date: string, pageNum: number, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
      setData([]); // Reset list for new status or search
    } else {
      setIsFetchingNextPage(true);
    }

    setError("");
    try {
      let url = `${API_URL.MODERATION_QUEUE}?status=${status}&page=${pageNum}&size=10`;
      if (date) {
        url += `&date=${date}`;
      }
      const response = await axiosInstance.get(url);
      const res = response.data;
      const newList = res?.data || [];

      setData(prev => append ? [...prev, ...newList] : newList);
      setHasMore(res?.has_next || false);
    } catch (err: any) {
      console.error("Failed to fetch approvals:", err);
      if (pageNum === 1) setError("Failed to load moderation queue. Please try again.");
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  // Triggered on activeTab or date change
  useEffect(() => {
    setPage(1);
    fetchData(activeTab, appliedDate, 1, false);
  }, [activeTab, appliedDate]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingNextPage) {
          setPage(prevPage => {
            const next = prevPage + 1;
            fetchData(activeTab, appliedDate, next, true);
            return next;
          });
        }
      },
      { threshold: 0.1, rootMargin: "100px" } // Load a bit early
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingNextPage, activeTab, appliedDate]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
          Moderation Queue
        </h1>
        {/* <p className="text-zinc-500 text-sm sm:text-base leading-relaxed">
          Review and authorize pending store actions carefully. Click any listing to examine detailed AI reasons and attached media.
        </p> */}
      </div>

      <Tabs defaultValue="draft" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="bg-zinc-100/70 p-1.5 rounded-2xl border border-zinc-200/60 inline-flex flex-wrap sm:flex-nowrap shadow-sm">
            <TabsList className="bg-transparent h-auto p-0 gap-1 sm:gap-2 border-none w-full sm:w-auto justify-start">
              <TabsTrigger
                value="draft"
                className="flex-1 sm:flex-none flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wide data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-500 transition-all uppercase"
              >
                <Clock className="h-4 w-4" />
                Draft
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="flex-1 sm:flex-none flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wide data-[state=active]:bg-[#00B523]/10 data-[state=active]:text-[#00B523] data-[state=active]:shadow-sm text-zinc-500 transition-all uppercase"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex-1 sm:flex-none flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wide data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:shadow-sm text-zinc-500 transition-all uppercase"
              >
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-auto">
              {/* <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" /> */}
              <Input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border-zinc-200/60 h-11 sm:w-[160px] rounded-xl text-sm focus:border-zinc-500 shadow-sm"
              />
            </div>
            <Button
              onClick={() => setAppliedDate(filterDate)}
              className="h-11 px-5 bg-[#00B523] hover:bg-[#009A1D] text-white rounded-xl font-semibold shadow-sm text-xs uppercase tracking-wide active:scale-[0.97] transition-all"
            >
              Filter
            </Button>
            {appliedDate && (
              <Button
                variant="outline"
                onClick={() => { setFilterDate(""); setAppliedDate(""); }}
                className="h-11 px-3 border-zinc-200/60 text-zinc-500 hover:text-zinc-800 rounded-xl shadow-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {loading ? (
            <div className="animate-fade-in space-y-4">
              {[1, 2, 3, 4, 5, 6].map((key) => (
                <Card key={key} className="bg-white/60 border-zinc-200/40 shadow-sm rounded-2xl overflow-hidden mb-4 animate-pulse">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4">
                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="h-5 w-1/3 min-w-[150px] bg-zinc-200 rounded-lg"></div>
                        <div className="h-4 w-16 bg-zinc-200/80 rounded-full"></div>
                      </div>
                      <div className="h-3 w-full max-w-xl bg-zinc-100 rounded-md"></div>
                    </div>
                    <div className="flex items-center gap-4 sm:shrink-0 mt-2 sm:mt-0 opacity-70">
                      <div className="h-3 w-28 bg-zinc-200 rounded-md"></div>
                      <div className="h-8 w-8 bg-zinc-100 rounded-full"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 text-red-600 rounded-3xl text-sm font-medium border border-red-100 text-center shadow-sm">
              <AlertCircle className="h-6 w-6 mx-auto mb-3 text-red-500" />
              {error}
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-3xl border border-zinc-200/60 shadow-sm text-center">
              <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center mb-6 border border-zinc-100 shadow-inner">
                {activeTab === 'draft' && <Clock className="h-8 w-8 text-zinc-300" />}
                {activeTab === 'approved' && <CheckCircle2 className="h-8 w-8 text-zinc-300" />}
                {activeTab === 'rejected' && <XCircle className="h-8 w-8 text-zinc-300" />}
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 mb-2">Queue is empty</h3>
              <p className="text-zinc-500 font-medium text-sm">No items found for {" "}<span className="uppercase font-semibold text-zinc-700">{activeTab}</span>{" "} status.</p>
            </div>
          ) : (
            <div className="animate-fade-in space-y-4">
              {data.map((item) => (
                <ApprovalRow
                  key={item.listing_id}
                  item={item}
                  onActionSuccess={() => fetchData(activeTab, appliedDate, 1, false)}
                />
              ))}

              {/* Observer target and Loading indicator */}
              <div ref={observerTarget} className="h-20 w-full flex flex-col items-center justify-center gap-4 py-4">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-3 text-zinc-500 font-semibold text-sm animate-in fade-in slide-in-from-bottom-2">
                    <Loader2 className="h-5 w-5 animate-spin text-[#00B523]" />
                    Fetching more items...
                  </div>
                )}
                {!hasMore && data.length > 0 && (
                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <div className="h-px w-24 bg-zinc-200" />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      End of records
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Approvals;
