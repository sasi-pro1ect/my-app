import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppFeatureGuideSchema, AppFeatureGuideFormValues } from "./schema";
import { FeatureSectionCard } from "./components/FeatureSectionCard";
import { CommonMediaSection } from "./components/CommonMediaSection";
import { Button } from "@/components/ui/button";
import { Plus, Save, Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Helper to remove empty optional objects/arrays strings
function cleanPayload(obj: any): any {
  if (Array.isArray(obj)) {
    const arr = obj
      .map(cleanPayload)
      .filter(
        (x) =>
          x !== null &&
          x !== undefined &&
          x !== "" &&
          !(typeof x === "object" && Object.keys(x).length === 0)
      );
    // Return array even if empty to keep structural predictability, 
    // unless strictly requested to omit entirely, but API lists are safer as [].
    if (obj.length > 0 && arr.length === 0) return [];
    return arr;
  } else if (typeof obj === "object" && obj !== null) {
    const res: any = {};
    let hasKeys = false;
    for (const key in obj) {
      if (key === "id" && !obj[key]) continue; // ignore empty string IDs
      const cleaned = cleanPayload(obj[key]);

      // Preserve "section_key" unconditionally for sections
      if (key === "section_key") {
        res[key] = obj[key] || "";
        hasKeys = true;
        continue;
      }

      const isEmptyArray = Array.isArray(cleaned) && cleaned.length === 0;
      // We'll allow empty arrays if the original was an empty array, it's safer for updates

      if (cleaned !== undefined && cleaned !== null && cleaned !== "") {
        res[key] = cleaned;
        hasKeys = true;
      }
    }
    return hasKeys ? res : undefined;
  }
  return obj;
}

export default function AppFeatureGuide() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSectionIndex, setDeletingSectionIndex] = useState<number | null>(null);

  const methods = useForm<AppFeatureGuideFormValues>({
    resolver: zodResolver(AppFeatureGuideSchema),
    defaultValues: { sections: [] },
  });

  const { control, handleSubmit, reset, formState: { isDirty } } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await axiosInstance.get(API_URL.APP_FEATURE_GUIDE);
        const data = response.data?.data || response.data;
        if (Array.isArray(data) && data.length > 0) {
          reset({ sections: data });
        } else {
          // Initialize with empty array
          reset({ sections: [] });
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          toast.error("Failed to fetch existing guide data");
        }
        reset({ sections: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuide();
  }, [reset]);

  const onSubmit = async (data: AppFeatureGuideFormValues) => {
    setIsSaving(true);
    try {
      const cleanedSections = cleanPayload(data.sections) || [];
      await axiosInstance.post(API_URL.APP_FEATURE_GUIDE, cleanedSections);
      toast.success("App Feature Guide saved successfully");
      reset(data); // Resets dirty state
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSection = async (index: number) => {
    const rawSection = methods.getValues().sections[index];

    const sectionIdToDelete = rawSection?.section_id;
    if (!sectionIdToDelete) {
      remove(index);
      return;
    }

    if (sectionIdToDelete) {
      setDeletingSectionIndex(index);
      try {
        await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?section_id=${sectionIdToDelete}`);
        toast.success("Section deleted from server");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to delete section from server");
      } finally {
        setDeletingSectionIndex(null);
      }
    }
    remove(index);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10 min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#28AF4B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 -ml-2 text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">App Feature Guide</h1>
          </div>
          <p className="text-sm text-zinc-500">
            Manage the content, steps, and media displayed in the App Feature Guide.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ section_key: "", steps: [] })}
            className="border-zinc-300"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Section
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              if (fields.some(f => f.section_key === "common_media")) {
                toast.error("Common Media section already exists.");
                return;
              }
              append({ section_key: "common_media", common_media: [] });
            }}
            disabled={fields.some(f => f.section_key === "common_media")}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Common Media
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-zinc-300 min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1">No Sections Found</h3>
              <p className="text-zinc-500 text-sm max-w-sm text-center mb-6">
                Get started by adding a regular feature section or the common media block.
              </p>
              <div className="flex gap-3">
                <Button type="button" onClick={() => append({ section_key: "", steps: [] })}>
                  Add Section
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {fields.map((field, sIndex) => {
                const isCommonMedia = field.section_key === "common_media";

                return !isCommonMedia ? (
                  <FeatureSectionCard
                    key={field.id}
                    sectionIndex={sIndex}
                    onRemove={() => handleRemoveSection(sIndex)}
                    isDeleting={deletingSectionIndex === sIndex}
                  />
                ) : (
                  <CommonMediaSection
                    key={field.id}
                    sectionIndex={sIndex}
                    onRemove={() => handleRemoveSection(sIndex)}
                    isDeleting={deletingSectionIndex === sIndex}
                  />
                );
              })}
            </div>
          )}

          <div className="sticky bottom-4 z-10 flex justify-end p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-zinc-200 shadow-xl mt-8">
            <Button
              type="submit"
              disabled={isSaving || !isDirty}
              className="bg-[#28AF4B] hover:bg-[#28AF4B]/90 text-white min-w-[140px] h-12 rounded-xl text-[15px] font-semibold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
