import { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppFeatureGuideSchema, AppFeatureGuideFormValues } from "./schema";
import { FeatureSectionCard } from "./components/FeatureSectionCard";
import { CommonMediaSection } from "./components/CommonMediaSection";
import { Button } from "@/components/ui/button";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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
    if (obj.length > 0 && arr.length === 0) return [];
    return arr;
  } else if (typeof obj === "object" && obj !== null) {
    const res: any = {};
    let hasKeys = false;
    for (const key in obj) {
      if (key === "id" && !obj[key]) continue;
      const cleaned = cleanPayload(obj[key]);

      if (key === "section_key") {
        res[key] = obj[key] || "";
        hasKeys = true;
        continue;
      }

      if (key === "common_media" && obj.section_key && obj.section_key !== "common_media") {
        continue;
      }
      if (key === "steps" && obj.section_key === "common_media") {
        continue;
      }

      if (cleaned !== undefined && cleaned !== null && cleaned !== "") {
        res[key] = cleaned;
        hasKeys = true;
      }
    }
    return hasKeys ? res : undefined;
  }
  return obj;
}

// Maps form schema to the specific names required by the PATCH API
function mapToBackendNames(data: any): any {
  if (Array.isArray(data)) return data.map(mapToBackendNames);
  if (typeof data !== "object" || data === null) return data;

  const mapped: any = {};
  
  if ("section_id" in data) mapped.section_id = data.section_id;
  if ("section_key" in data) mapped.section_key = data.section_key;

  if ("title" in data) mapped.section_title = data.title;
  if ("icon" in data) mapped.section_icon = data.icon;
  if ("subtitle" in data) mapped.section_subtitle = data.subtitle;

  if ("steps" in data) {
    mapped.steps = data.steps.map((step: any) => ({
      step_id: step.id,
      step_title: step.title,
      step_description: step.description,
      step_icon: step.icon,
      media: mapToBackendNames(step.media)
    }));
  }

  const mapMedia = (media: any) => ({
    media_id: media.id,
    media_title: media.title,
    media_url: media.media_url,
    media_type: media.type,
    thumbnail_url: media.thumbnail_url
  });

  if ("common_media" in data) {
    mapped.common_media = data.common_media.map(mapMedia);
  }
  
  if ("media_url" in data) return mapMedia(data);

  return mapped;
}

// Maps backend names back to form-friendly schema names
// Handles both renamed keys (section_title) and already-correct keys (title)
function mapFromBackendNames(data: any): any {
  if (Array.isArray(data)) return data.map(mapFromBackendNames);
  if (typeof data !== "object" || data === null) return data;

  const mapped: any = { ...data };

  // Section level — only remap if backend-specific keys exist
  if ("section_title" in data) mapped.title = data.section_title;
  if ("section_icon" in data) mapped.icon = data.section_icon;
  if ("section_subtitle" in data) mapped.subtitle = data.section_subtitle;

  // Step level
  if (Array.isArray(data.steps)) {
    mapped.steps = data.steps.map((step: any) => ({
      ...step,
      // Only remap if backend-specific keys present, else keep original
      id: step.step_id ?? step.id,
      title: step.step_title ?? step.title,
      description: step.step_description ?? step.description,
      icon: step.step_icon ?? step.icon,
      media: Array.isArray(step.media) ? step.media.map(remapMedia) : [],
    }));
  }

  // Common media level
  if (Array.isArray(data.common_media)) {
    mapped.common_media = data.common_media.map(remapMedia);
  }

  return mapped;
}

function remapMedia(m: any) {
  return {
    ...m,
    id: m.media_id ?? m.id,
    title: m.media_title ?? m.title,
    type: m.media_type ?? m.type,
    media_url: m.media_url,
    thumbnail_url: m.thumbnail_url,
  };
}

// Filters data to only include fields that are dirty (changed)
function filterDirtyFields(data: any, dirtyFields: any): any {
  if (Array.isArray(data)) {
    return data.map((item, index) => filterDirtyFields(item, dirtyFields?.[index])).filter(Boolean);
  }
  
  if (typeof data !== "object" || data === null || !dirtyFields) return data;

  const result: any = {};
  let hasChanges = false;

  // Essential fields should always be included
  const essentialKeys = ["section_id", "section_key", "id", "section_title", "section_icon"];
  
  for (const key in data) {
    if (dirtyFields[key]) {
      if (typeof dirtyFields[key] === "object" && !Array.isArray(dirtyFields[key])) {
        const nested = filterDirtyFields(data[key], dirtyFields[key]);
        if (nested) {
          result[key] = nested;
          hasChanges = true;
        }
      } else {
        result[key] = data[key];
        hasChanges = true;
      }
    } else if (essentialKeys.includes(key)) {
       // Keep ID and keys for identification
       result[key] = data[key];
    }
  }

  return hasChanges ? result : (result.section_id ? result : null);
}

export default function AppFeatureDetail() {
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId: string }>();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "true");
  const [deletingSectionIndex, setDeletingSectionIndex] = useState<number | null>(null);

  const methods = useForm<AppFeatureGuideFormValues>({
    resolver: zodResolver(AppFeatureGuideSchema),
    defaultValues: { sections: [] },
  });

  const { control, handleSubmit, reset, formState: { isDirty, dirtyFields } } = methods;

  const { fields, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const isCreating = sectionId === "create" || sectionId === "create-common";

  useEffect(() => {
    if (isCreating) {
      if (sectionId === "create-common") {
        reset({ sections: [{ section_key: "common_media", title: "", subtitle: "", common_media: [] }] });
      } else {
        reset({ sections: [{ section_key: "", title: "", subtitle: "", steps: [] }] });
      }
      setIsLoading(false);
      return;
    }

    const fetchGuide = async () => {
      try {
        const response = await axiosInstance.get(`${API_URL.APP_FEATURE_GUIDE}?section_id=${sectionId}`);
        const data = response.data?.data || response.data;
        
        // Handle both single object and array responses
        let targetSection = null;
        if (Array.isArray(data)) {
          targetSection = data[0];
        } else if (data && typeof data === 'object') {
          targetSection = data;
        }

        if (targetSection) {
          // Map backend names back to form schema names
          const mappedSection = mapFromBackendNames(targetSection);
          reset({ sections: [mappedSection] });
        } else {
          toast.error("Config section not found.");
          navigate("/dashboard/app-feature-guide");
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          toast.error("Failed to fetch existing guide data");
        }
        navigate("/dashboard/app-feature-guide");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuide();
  }, [reset, sectionId, navigate, isCreating]);

  const onSubmit = async (data: AppFeatureGuideFormValues) => {
    setIsSaving(true);
    try {
      if (isCreating) {
        const cleanedSections = cleanPayload(data.sections) || [];
        await axiosInstance.post(API_URL.APP_FEATURE_GUIDE, cleanedSections);
        toast.success("App configuration created!");
        navigate("/dashboard/app-feature-guide");
      } else {
        // 1. Filter only dirty (changed) fields
        const dirtyData = filterDirtyFields(data.sections, dirtyFields.sections);
        
        // 2. Map fields to backend specific names (section_title, etc.)
        const patchPayload = mapToBackendNames(dirtyData);
        
        // Ensure it's an array for the API
        const finalPayload = Array.isArray(patchPayload) ? patchPayload : [patchPayload];

        await axiosInstance.patch(API_URL.APP_FEATURE_GUIDE, finalPayload);
        toast.success("Section updated successfully");
        setIsEditing(false);
        reset(data);
      }
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
      if (!isCreating) {
        toast.error("Missing section_id for this section");
      }
      remove(index);
      return;
    }

    if (sectionIdToDelete) {
      setDeletingSectionIndex(index);
      try {
        await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?section_id=${sectionIdToDelete}`);
        toast.success("Section deleted from server");
        navigate("/dashboard/app-feature-guide");
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

  // Expecting exactly 1 field
  const field = fields[0];
  if (!field) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/app-feature-guide")} className="h-8 w-8 -ml-2 text-zinc-500 hover:text-zinc-900">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              {isCreating 
                ? (sectionId === "create-common" ? "Create Common Media" : "Create App Config") 
                : `${field.section_key}`}
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            {isCreating 
              ? "Set up the content, steps, and media for a brand new section." 
              : isEditing 
                ? "Update the configuration details below." 
                : "View the details and configuration of this feature section."}
          </p>
        </div>
        {!isCreating && !isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-[#28AF4B] hover:bg-[#28AF4B]/90 text-white min-w-[120px]"
          >
            Edit Configuration
          </Button>
        )}
        {isEditing && (
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              reset();
            }}
          >
            Cancel Editing
          </Button>
        )}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.error("Validation Errors:", errors);
          toast.error("Form validation failed. Check console for details.");
        })} className="space-y-6 pb-20">
          <fieldset disabled={!isCreating && !isEditing} className="space-y-8 disabled:opacity-100">
            {field.section_key !== "common_media" ? (
              <FeatureSectionCard
                key={field.id}
                sectionIndex={0}
                onRemove={() => handleRemoveSection(0)}
                isDeleting={deletingSectionIndex === 0}
                isViewOnly={!isCreating && !isEditing}
                isEditing={isEditing}
              />
            ) : (
              <CommonMediaSection
                key={field.id}
                sectionIndex={0}
                onRemove={() => handleRemoveSection(0)}
                isDeleting={deletingSectionIndex === 0}
                isViewOnly={!isCreating && !isEditing}
              />
            )}
          </fieldset>

          {(isCreating || isEditing) && (
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
                    <Save className="h-5 w-5 mr-2" /> {isCreating ? "Create Guide" : "Update Changes"}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
