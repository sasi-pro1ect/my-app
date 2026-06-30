import { useFieldArray, useFormContext } from "react-hook-form";
import { AppFeatureGuideFormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { MEDIA_TYPES } from "../constants";

interface FeatureStepCardProps {
  sectionIndex: number;
  stepIndex: number;
  onRemove: () => void;
  isDeleting?: boolean;
  isViewOnly?: boolean;
}

export function FeatureStepCard({ sectionIndex, stepIndex, onRemove, isDeleting, isViewOnly }: FeatureStepCardProps) {
  const { register, control, watch, setValue } = useFormContext<AppFeatureGuideFormValues>();
  const stepPrefix = `sections.${sectionIndex}.steps.${stepIndex}` as const;

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control,
    name: `${stepPrefix}.media`,
  });

  const [isDeletingMedia, setIsDeletingMedia] = useState<string | null>(null);

  const handleDeleteMedia = async (index: number, mediaId?: string) => {
    if (mediaId && mediaId.trim() !== "") {
      setIsDeletingMedia(mediaId);
      try {
        await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?media_id=${mediaId}`);
        toast.success("Media deleted from server");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete media");
        setIsDeletingMedia(null);
        return;
      }
      setIsDeletingMedia(null);
    }
    removeMedia(index);
  };

  return (
    <div className="p-4 border border-zinc-200 rounded-xl bg-white shadow-sm relative space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
        <h4 className="font-semibold text-zinc-700">Step {stepIndex + 1}</h4>
        {!isViewOnly && (
          <Button variant="ghost" size="sm" onClick={onRemove} disabled={isDeleting} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} Remove Step
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Step Title</label>
            <Input {...register(`${stepPrefix}.title`)} placeholder="Enter step title" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Description</label>
            <Textarea {...register(`${stepPrefix}.description`)} placeholder="Enter step description" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 mb-1 block">Step Icon</label>
          <div className="aspect-[594/593] w-full max-w-[300px]">
            <MediaUploader
              value={watch(`${stepPrefix}.icon`)}
              onChange={(url) => setValue(`${stepPrefix}.icon`, url, { shouldDirty: true })}
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

      <div className="mt-4 pt-4 border-t border-zinc-100">
        <div className="flex justify-between items-center mb-3">
          <h5 className="font-medium text-zinc-700">Step Media</h5>
          {!isViewOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendMedia({ type: MEDIA_TYPES.IMAGE, media_url: "", thumbnail_url: "", title: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Media
            </Button>
          )}
        </div>

        {mediaFields.length > 0 ? (
          <div className="space-y-4">
            {mediaFields.map((mediaField, mIndex) => {
              const mPrefix = `${stepPrefix}.media.${mIndex}` as const;
              const mediaId = watch(`${mPrefix}.id`);
              return (
                <div key={mediaField.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg relative flex flex-col gap-4 overflow-hidden">
                  {!isViewOnly && (
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteMedia(mIndex, mediaId)}
                        disabled={isDeletingMedia === mediaId && !!mediaId}
                      >
                        {isDeletingMedia === mediaId && !!mediaId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                  <div className="space-y-4 w-full">
                    <div>
                      <label className="text-xs font-medium text-zinc-700 mb-1 block">Title</label>
                      <Input size={1} className="h-8" {...register(`${mPrefix}.title`)} placeholder="Media title" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-52">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Media Upload</p>
                        <div className="h-full pb-4">
                          <MediaUploader
                            value={watch(`${mPrefix}.media_url`)}
                            onChange={(url, type) => {
                              setValue(`${mPrefix}.media_url`, url);
                              if (type) setValue(`${mPrefix}.type`, type);
                            }}
                            onDelete={() => setValue(`${mPrefix}.media_url`, "")}
                            label=""
                            className="h-full"
                            isViewOnly={isViewOnly}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Thumbnail</p>
                        <div className="h-full pb-4">
                          <MediaUploader
                            value={watch(`${mPrefix}.thumbnail_url`)}
                            onChange={(url) => setValue(`${mPrefix}.thumbnail_url`, url)}
                            onDelete={() => setValue(`${mPrefix}.thumbnail_url`, "")}
                            label=""
                            accept="image/*"
                            isViewOnly={isViewOnly}
                            className="h-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-4 text-sm text-zinc-500 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
            No media added for this step.
          </div>
        )}
      </div>
    </div>
  );
}
