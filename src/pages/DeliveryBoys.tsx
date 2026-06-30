import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Search, Loader2, Calendar, Clock, Car, X, ChevronDown } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";

interface Availability {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Executive {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  vehicle_types: string[];
  availability: Availability[];
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AgentRow = ({ agent }: { agent: Executive }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`bg-white border-zinc-200/60 shadow-sm transition-all rounded-[1.5rem] overflow-hidden group ${expanded ? 'ring-2 ring-zinc-100 shadow-md transform scale-[1.01]' : 'hover:shadow-md hover:border-zinc-300'}`}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-5 cursor-pointer hover:bg-zinc-50/50 transition-all duration-300"
      >
        {/* Agent Info Core */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
          <div className="h-16 w-16 min-w-[4rem] rounded-2xl bg-gradient-to-br from-[#00B523]/10 to-[#00B523]/5 flex items-center justify-center text-[#00B523] font-semibold text-2xl ring-1 ring-[#00B523]/20 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0">
            {agent.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="font-semibold text-zinc-900 text-xl leading-none">{agent.name}</p>
              <Badge className={`uppercase tracking-widest text-[10px] px-2.5 py-0.5 border-none shadow-sm ${agent.active ? "bg-[#00B523] text-white" : "bg-zinc-200 text-zinc-600"}`}>
                {agent.active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {agent.vehicle_types.map(vt => (
                <span key={vt} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2.5 py-1 rounded-lg">
                  <Car className="h-3 w-3 text-zinc-400" /> {vt}
                </span>
              ))}
              {!agent.vehicle_types.length && <span className="text-xs text-zinc-400 italic font-medium">No vehicles assigned</span>}
            </div>
          </div>
        </div>

        {/* Quick Actions & chevron */}
        <div className="flex items-center gap-4 sm:shrink-0 mt-3 sm:mt-0 ml-1 sm:ml-0">
          <a
            onClick={(e) => e.stopPropagation()}
            href={`tel:${agent.phone}`}
            className="flex items-center gap-2.5 px-4 py-3 sm:py-2.5 bg-zinc-50 hover:bg-[#00B523]/10 text-zinc-700 hover:text-[#009A1D] rounded-xl text-sm font-semibold transition-colors border border-zinc-200/50"
          >
            <Phone className="h-4 w-4" /> {agent.phone || "No Phone"}
          </a>
          <div className={`p-2 rounded-full transition-transform duration-300 ${expanded ? "rotate-180 bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-400"}`}>
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Expanded Layout - Full Width Schedule */}
      {expanded && (
        <CardContent className="px-5 sm:px-6 pb-6 pt-0 border-t border-zinc-100 bg-zinc-50/40 animate-in slide-in-from-top-2 mt-0">
          <div className="pt-6">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              <Clock className="h-4 w-4" /> Shift Availability
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
              {agent.availability && agent.availability.length > 0 ? (
                agent.availability.map((shift, idx) => (
                  <div key={idx} className="flex flex-col bg-white px-5 py-4 rounded-[1.25rem] border border-zinc-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-[#00B523]/30 transition-colors">
                    <span className="text-zinc-600 font-semibold mb-1.5">{days[shift.day_of_week] || "Unknown"}</span>
                    <span className="text-[#00B523] font-semibold text-sm bg-[#00B523]/10 px-3 py-1.5 rounded-lg w-fit">
                      {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-dashed border-zinc-200">
                  <Clock className="h-8 w-8 text-zinc-300 mb-3" />
                  <span className="text-base font-semibold text-zinc-500">No shifts scheduled for this agent.</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const DeliveryBoys = () => {
  const [agents, setAgents] = useState<Executive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const observerTarget = useRef(null);

  const fetchAgents = async (pageNum: number, dateParam: string, append: boolean = false) => {
    if (pageNum === 1) {
      setLoading(true);
      if (!append) setAgents([]);
    } else {
      setIsFetchingNextPage(true);
    }

    setError("");
    try {
      const params: Record<string, any> = {
        page: pageNum,
        size: 10
      };
      if (dateParam) params.target_date = dateParam;

      const { data } = await axiosInstance.get(API_URL.DELIVERY_BOYS, { params });
      const newList = data?.data || [];
      
      setAgents(prev => append ? [...prev, ...newList] : newList);
      setHasMore(data?.has_next || false);
      setTotalRecords(data?.total || 0);
    } catch (err) {
      console.error("Failed to load agents:", err);
      if (pageNum === 1) setError("Failed to load swap agents. Please try again or check your connection.");
    } finally {
      setLoading(false);
      setIsFetchingNextPage(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchAgents(1, targetDate, false);
  }, [targetDate]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !isFetchingNextPage) {
          setPage(prevPage => {
            const next = prevPage + 1;
            fetchAgents(next, targetDate, true);
            return next;
          });
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingNextPage, targetDate]);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">

      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 shadow-sm relative overflow-hidden">
        {/* Soft decorative background flare */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00B523]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Swap Agents
            </h1>
            <Badge className="bg-[#00B523]/10 text-[#009A1D] border-none px-3 py-1 font-semibold text-sm shadow-sm transition-colors">
              {totalRecords} Total
            </Badge>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
            Monitor your field operators, easily review their scheduled shifts, and quickly initiate contact with active personnel.
          </p>
        </div>

        {/* Date Filter Widget */}
        <div className="relative z-10 shrink-0 flex items-center bg-zinc-50 border border-zinc-200/80 rounded-2xl px-5 py-3.5 shadow-sm transition-all focus-within:ring-4 focus-within:ring-[#00B523]/15 focus-within:border-[#00B523] focus-within:bg-white group cursor-pointer hover:shadow-md">
          {/* <Calendar className="h-5 w-5 text-zinc-400 mr-4 group-hover:text-[#00B523] transition-colors shrink-0" /> */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider mb-0.5">Filter Schedule</span>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-transparent border-none outline-none text-zinc-900 font-semibold text-sm w-[130px] sm:w-[140px] cursor-pointer"
            />
          </div>
          {targetDate && (
            <button
              onClick={(e) => { e.preventDefault(); setTargetDate(''); }}
              className="ml-4 p-1 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
              title="Clear Filter"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm">
          <Loader2 className="h-12 w-12 animate-spin text-[#00B523] mb-5" />
          <p className="text-zinc-500 font-semibold tracking-wide text-lg">Loading active agents...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-600 rounded-[2rem] text-sm font-semibold border border-red-100 text-center shadow-sm flex flex-col items-center justify-center">
          <X className="h-8 w-8 text-red-500 mb-3" />
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-zinc-50/50 rounded-[2rem] border-2 border-dashed border-zinc-200 text-center group transition-colors hover:bg-zinc-50">
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform duration-500">
            <Search className="h-10 w-10 text-zinc-300" />
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-2">No agents scheduled</h3>
          <p className="text-zinc-500 font-medium text-base">
            We couldn't find any swap agents registered for {targetDate ? new Date(targetDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'today'}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {agents.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))}

          {/* Observer target and Loading indicator */}
          <div ref={observerTarget} className="h-24 w-full flex flex-col items-center justify-center gap-4 py-8">
            {isFetchingNextPage && (
              <div className="flex items-center gap-3 text-zinc-500 font-semibold text-sm animate-in fade-in slide-in-from-bottom-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#00B523]" />
                Fetching more agents...
              </div>
            )}
            {!hasMore && agents.length > 0 && (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <div className="h-px w-32 bg-zinc-200" />
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                  End of agent directory
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoys;
