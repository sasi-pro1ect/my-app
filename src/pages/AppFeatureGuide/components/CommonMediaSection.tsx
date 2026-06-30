import { useFieldArray, useFormContext } from "react-hook-form";
import { AppFeatureGuideFormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Images, Loader2 } from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { toast } from "sonner";
import { MEDIA_TYPES } from "../constants";

interface CommonMediaSectionProps {
  sectionIndex: number;
  onRemove: () => void;
  isDeleting?: boolean;
  isViewOnly?: boolean;
}

export function CommonMediaSection({ sectionIndex, onRemove, isDeleting, isViewOnly }: CommonMediaSectionProps) {
  const { register, control, watch, setValue } = useFormContext<AppFeatureGuideFormValues>();
  const sectionPrefix = `sections.${sectionIndex}` as const;

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control,
    name: `${sectionPrefix}.common_media`,
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

  // Ensure section key remains strictly "common_media"
  setValue(`${sectionPrefix}.section_key`, "common_media");

  return (
    <div className="p-5 border border-zinc-200 rounded-2xl bg-[#eff0f2]/50 shadow-sm space-y-5 relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#28AF4B] rounded-l-2xl"></div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#28AF4B]/10 flex items-center justify-center">
            <Images className="h-4 w-4 text-[#28AF4B]" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Common Media Section</h3>
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
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Title</label>
            <Input {...register(`${sectionPrefix}.title`)} placeholder="Common Media title" />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-1 block">Subtitle</label>
            <Input {...register(`${sectionPrefix}.subtitle`)} placeholder="Common Media subtitle" />
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

      <div className="pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-zinc-900">Media List</h4>
          {!isViewOnly && (
            <Button
              type="button"
              className="bg-[#28AF4B] hover:bg-[#28AF4B]/90 text-white"
              size="sm"
              onClick={() => appendMedia({ type: MEDIA_TYPES.VIDEO, media_url: "", thumbnail_url: "", title: "" })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Common Media
            </Button>
          )}
        </div>

        {mediaFields.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mediaFields.map((mediaField, mIndex) => {
              const mPrefix = `${sectionPrefix}.common_media.${mIndex}` as const;
              const mediaId = watch(`${mPrefix}.id`);
              return (
                <div key={mediaField.id} className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4 relative">
                  {!isViewOnly && (
                    <div className="absolute top-2 right-2 z-10">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-6 w-6 rounded-full shadow-sm"
                        onClick={() => handleDeleteMedia(mIndex, mediaId)}
                        disabled={isDeletingMedia === mediaId && !!mediaId}
                      >
                        {isDeletingMedia === mediaId && !!mediaId ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input size={1} className="h-9 shadow-sm" {...register(`${mPrefix}.title`)} placeholder="Media title" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 h-56">
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Main Media</p>
                      <div className="h-full pb-4">
                        <MediaUploader
                          mediaId={mediaId}
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
              );
            })}
          </div>
        ) : (
          <div className="text-center p-6 text-sm text-zinc-500 bg-white rounded-xl border border-dashed border-zinc-300">
            No common media exist. Click "Add Common Media" to add videos or images.
          </div>
        )}
      </div>
    </div>
  );
}
