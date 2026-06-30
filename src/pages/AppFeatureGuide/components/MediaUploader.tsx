import React, { useRef, useState } from "react";
import { UploadCloud, Trash2, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/services/axios.instance";
import { API_URL } from "@/services/apiConfig";
import { MEDIA_TYPES, MediaType } from "../constants";
import { resizePngToFit } from "@/lib/image";

interface MediaUploaderProps {
  value?: string;
  onChange: (url: string, type?: MediaType) => void;
  onDelete?: () => void;
  mediaId?: string | number; // used for the explicit delete API if the media object has an ID
  label?: string;
  className?: string;
  accept?: "image/*" | "video/*" | "image/*,video/*";
  isViewOnly?: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

export function MediaUploader({
  value,
  onChange,
  onDelete,
  mediaId,
  label = "Upload Media",
  className = "",
  accept = "image/*,video/*",
  isViewOnly = false,
  targetWidth,
  targetHeight,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let fileToUpload = file;

    // Resize if target dimensions are provided and it's an image
    if (targetWidth && targetHeight && file.type.startsWith("image/")) {
      try {
        fileToUpload = await resizePngToFit(file, targetWidth, targetHeight);
      } catch (error: any) {
        toast.error(error.message || "Failed to process image");
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }

    const formData = new FormData();
    // Use the appropriate field name depending on file type
    const fieldName = fileToUpload.type.startsWith("video/") ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE;
    formData.append(fieldName, fileToUpload);

    try {
      const response = await axiosInstance.post(API_URL.APP_FEATURE_GUIDE_UPLOAD, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Extract URL from response based on the API structure.
      const url = response.data?.video_url || response.data?.image_url || response.data?.url || response.data?.media_url || response.data?.data?.url || (typeof response.data === 'string' ? response.data : null);

      if (url) {
        const detectedType = file.type.startsWith("video/") ? MEDIA_TYPES.VIDEO : MEDIA_TYPES.IMAGE;
        onChange(url, detectedType);
        toast.success(response.data?.message || "Media uploaded successfully");
      } else {
        toast.error("Upload succeeded but URL format could not be extracted.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload media");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (mediaId) {
      setIsDeleting(true);
      try {
        await axiosInstance.delete(`${API_URL.APP_FEATURE_GUIDE}?media_id=${mediaId}`);
        toast.success("Media deleted from server");
        if (onDelete) onDelete();
        else onChange("");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete media from server");
      } finally {
        setIsDeleting(false);
      }
    } else {
      if (onDelete) onDelete();
      else onChange("");
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium text-zinc-700">{label}</label>}
      <div className="relative border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center h-full min-h-[40px] bg-zinc-50 hover:bg-zinc-100 transition-colors overflow-hidden group">
        {value ? (
          <div className="relative w-full h-full flex items-center justify-center p-1">
            {value.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={value} className="h-full w-full object-cover rounded-md" controls />
            ) : (
              <img src={value} alt="Uploaded Media" className="h-full w-full object-cover rounded-md" />
            )}
            {!isViewOnly && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1.5 rounded-lg backdrop-blur-sm">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  type="button"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-500">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            ) : (
              <UploadCloud className="h-8 w-8 text-zinc-400" />
            )}
            <span className="text-sm font-medium">
              {isViewOnly ? "No media uploaded" : isUploading ? "Uploading..." : "Click to upload"}
            </span>
            {!isViewOnly && (
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept={accept}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || isDeleting}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
