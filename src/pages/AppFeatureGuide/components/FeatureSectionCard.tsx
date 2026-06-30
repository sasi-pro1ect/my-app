import { useFieldArray, useFormContext } from "react-hook-form";
import { AppFeatureGuideFormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, LayoutTemplate, Loader2 } from "lucide-react";
import { FeatureStepCard } from "./FeatureStepCard";
import { useState } from "react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { MediaUploader } from "./MediaUploader";

interface FeatureSectionCardProps {
  sectionIndex: number;
  onRemove: () => void;
  isDeleting?: boolean;
  isViewOnly?: boolean;
  isEditing?: boolean;
}

export function FeatureSectionCard({ sectionIndex, onRemove, isDeleting, isViewOnly, isEditing }: FeatureSectionCardProps) {
  const { register, control, watch, setValue } = useFormContext<AppFeatureGuideFormValues>();
  const sectionPrefix = `sections.${sectionIndex}` as const;

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: `${sectionPrefix}.steps`,
  });

  const [deletingStepIndex, setDeletingStepIndex] = useState<number | null>(null);

  const handleRemoveStep = async (stepIndex: number) => {
    const rawStep = watch(`${sectionPrefix}.steps.${stepIndex}`);
    if (rawStep && rawStep.id) {
      setDeletingStepIndex(stepIndex);
      try {
        await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?step_id=${rawStep.id}`);
        toast.success("Step deleted from server");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to delete step from server");
      } finally {
        setDeletingStepIndex(null);
      }
    }
    removeStep(stepIndex);
  };

  return (
    <div className="p-5 border border-zinc-200 rounded-2xl bg-white shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <LayoutTemplate className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Feature Section</h3>
        </div>
        {!isViewOnly && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={isDeleting} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Section Key <span className="text-red-500">*</span></label>
            <Input 
              {...register(`${sectionPrefix}.section_key`)} 
              placeholder="e.g. how_it_work" 
              required 
              disabled={isEditing}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Title</label>
            <Input {...register(`${sectionPrefix}.title`)} placeholder="Section title" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Subtitle</label>
            <Input {...register(`${sectionPrefix}.subtitle`)} placeholder="Section subtitle" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">Section Icon</label>
          <div className="aspect-[594/593] w-full max-w-[300px]">
            <MediaUploader
              value={watch(`${sectionPrefix}.icon`)}
              onChange={(url) => setValue(`${sectionPrefix}.icon`, url, { shouldDirty: true })}
              label=""
              isViewOnly={isViewOnly}
              className="h-full w-full"
              targetWidth={594}
              targetHeight={593}
              accept="image/png"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-zinc-900">Steps</h4>
          {!isViewOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStep({ title: "", description: "", icon: "", media: [] })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Step
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {stepFields.length > 0 ? (
            stepFields.map((field, sIndex) => (
              <FeatureStepCard
                key={field.id}
                sectionIndex={sectionIndex}
                stepIndex={sIndex}
                onRemove={() => handleRemoveStep(sIndex)}
                isDeleting={deletingStepIndex === sIndex}
                isViewOnly={isViewOnly}
              />
            ))
          ) : (
            <div className="text-center p-6 text-sm text-zinc-500 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
              No steps created yet. Click "Add Step" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
