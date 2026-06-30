import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
}

export function ImageViewerModal({ isOpen, onClose, src, alt }: ImageViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom & Scroll
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      // Zoom
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.2, Math.min(prev + delta, 5)));
    } else {
      // Scroll vertically when zoomed
      if (scale > 1) {
        setPosition(prev => ({
          ...prev,
          y: prev.y - e.deltaY
        }));
      }
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-full w-full h-full p-0 overflow-hidden bg-zinc-950/30 backdrop-blur-sm border-none shadow-none sm:rounded-none outline-none">
        <VisuallyHidden.Root>
          <DialogTitle>Image Viewer - {alt}</DialogTitle>
        </VisuallyHidden.Root>

        <div
          className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Controls Overlay */}
          <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
            <div className="flex bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-1.5 shadow-2xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/10 h-10 w-10 rounded-xl transition-all active:scale-95"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <div className="w-px h-8 bg-white/10 self-center mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="text-white hover:bg-white/10 h-10 w-10 rounded-xl transition-all active:scale-95"
                title="Reset View"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <div className="w-px h-8 bg-white/10 self-center mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="text-white hover:bg-white/10 h-10 w-10 rounded-xl transition-all active:scale-95"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="bg-black/40 backdrop-blur-xl text-white hover:bg-red-500/80 hover:text-white rounded-2xl border border-white/10 h-10 w-10 shadow-2xl transition-all active:scale-95"
              title="Close"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Image Canvas */}
          <div
            className={`w-full h-full flex items-center justify-center ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} overflow-hidden relative select-none`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div
              className="relative transition-transform duration-200 ease-out will-change-transform flex items-center justify-center"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="max-w-full max-h-[85vh] object-contain select-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] rounded-lg"
              />
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black/20 backdrop-blur-2xl rounded-full border border-white/5 shadow-2xl">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
              {Math.round(scale * 100)}% Focus • {alt}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
