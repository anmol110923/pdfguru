"use client";

import {
  Crop,
  Maximize2,
  RotateCcw,
  RotateCw,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  zoom: number;
  cropMode: boolean;
  disabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onCrop: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onReset: () => void;
}

function Tool({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({
  zoom,
  cropMode,
  disabled,
  onZoomIn,
  onZoomOut,
  onFit,
  onCrop,
  onRotateLeft,
  onRotateRight,
  onReset,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-border/80 bg-card/95 px-1.5 py-1 shadow-md backdrop-blur-sm">
      <Tool label="Zoom out" onClick={onZoomOut} disabled={disabled || zoom <= MIN_ZOOM}>
        <ZoomOut />
      </Tool>
      <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
        {Math.round(zoom * 100)}%
      </span>
      <Tool label="Zoom in" onClick={onZoomIn} disabled={disabled || zoom >= MAX_ZOOM}>
        <ZoomIn />
      </Tool>
      <Tool label="Fit" onClick={onFit} disabled={disabled}>
        <Maximize2 />
      </Tool>
      <span className="mx-1 h-4 w-px bg-border" />
      <Tool label="Crop" onClick={onCrop} disabled={disabled}>
        <Crop className={cn(cropMode && "text-primary")} />
      </Tool>
      <Tool label="Rotate left" onClick={onRotateLeft} disabled={disabled}>
        <RotateCcw />
      </Tool>
      <Tool label="Rotate right" onClick={onRotateRight} disabled={disabled}>
        <RotateCw />
      </Tool>
      <Tool label="Reset" onClick={onReset} disabled={disabled}>
        <Undo2 />
      </Tool>
    </div>
  );
}
