"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { PdfSettings } from "@/lib/store/types";

interface PdfSettingsProps {
  settings: PdfSettings;
  onChange: (patch: Partial<PdfSettings>) => void;
  className?: string;
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-3 rounded-lg border border-input bg-muted/50 p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={cn(
            "rounded-md px-2 py-1.5 text-xs font-medium transition-colors duration-200",
            value === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PdfSettings({ settings, onChange, className }: PdfSettingsProps) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="px-4 pb-2 pt-3">
        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          PDF settings
        </h2>
      </div>
      <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
        <div className="space-y-1.5">
          <Label htmlFor="doc-title">Document title</Label>
          <Input
            id="doc-title"
            value={settings.title}
            placeholder="Operating Systems — Unit 3"
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-subject">
            Subject <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="doc-subject"
            value={settings.subject}
            placeholder="Lecture notes"
            onChange={(event) => onChange({ subject: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="page-size">Page size</Label>
          <select
            id="page-size"
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={settings.pageSize}
            onChange={(event) =>
              onChange({ pageSize: event.target.value as PdfSettings["pageSize"] })
            }
          >
            <option value="a4">A4</option>
            <option value="letter">Letter</option>
            <option value="original">Original</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Orientation</Label>
          <Segmented
            label="Orientation"
            value={settings.orientation}
            onChange={(orientation) => onChange({ orientation })}
            options={[
              { value: "auto", label: "Auto" },
              { value: "portrait", label: "Portrait" },
              { value: "landscape", label: "Landscape" },
            ]}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="page-numbers">Page numbers</Label>
          <Switch
            id="page-numbers"
            checked={settings.pageNumbers}
            onCheckedChange={(pageNumbers) => onChange({ pageNumbers })}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="cover-page">Cover page</Label>
          <Switch
            id="cover-page"
            checked={settings.coverPage}
            onCheckedChange={(coverPage) => onChange({ coverPage })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quality">Image quality</Label>
          <select
            id="quality"
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={settings.quality}
            onChange={(event) =>
              onChange({ quality: event.target.value as PdfSettings["quality"] })
            }
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="compressed">Compressed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
