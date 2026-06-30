import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search } from "lucide-react";

const CatalogueCreate = () => {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Inventory Item "${name}" verified & logged.`);
    setName("");
    setSku("");
    setCondition("");
    setDescription("");
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto mt-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-1">
          Verify Inventory Item
        </h1>
        <p className="text-zinc-500 text-base">
          Log a newly accepted swap item into the global catalogue.
        </p>
      </div>

      <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 py-5 px-8 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-zinc-900">
            Item Details
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
            <Search className="h-4 w-4" />
            Auto-sync enabled
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-zinc-700 font-semibold text-sm">Item Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Sony Wireless Headphones" 
                  required 
                  className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-12 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm" 
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="sku" className="text-zinc-700 font-semibold text-sm">Assigned SKU / ID</Label>
                <Input 
                  id="sku" 
                  value={sku} 
                  onChange={(e) => setSku(e.target.value)} 
                  placeholder="SWP-10928A" 
                  required 
                  className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-12 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm font-mono uppercase" 
                />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <Label htmlFor="condition" className="text-zinc-700 font-semibold text-sm">Quality Condition</Label>
              <Input 
                id="condition" 
                value={condition} 
                onChange={(e) => setCondition(e.target.value)} 
                placeholder="e.g. Excellent - Box Opened" 
                required 
                className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 h-12 px-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm" 
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="desc" className="text-zinc-700 font-semibold text-sm">Store Supervisor Notes</Label>
              <Textarea 
                id="desc" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Any scuffs, missing manuals, or additional context for dispatch..." 
                rows={4} 
                className="bg-zinc-50/50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 p-4 rounded-xl focus:border-[#00B523] focus:ring-4 focus:ring-[#00B523]/10 transition-all shadow-sm resize-y" 
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <Button 
                type="submit" 
                className="h-12 px-8 text-base font-bold bg-[#00B523] hover:bg-[#009A1D] text-white rounded-xl transition-all shadow-xl shadow-[#00B523]/20 hover:shadow-2xl hover:shadow-[#00B523]/30 hover:-translate-y-0.5 active:scale-[0.98] border-none"
              >
                Log Inventory Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CatalogueCreate;
