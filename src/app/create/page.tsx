import { Suspense } from "react";
import { EditorPage } from "@/components/editor/EditorPage";

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">Loading editor…</div>}>
      <EditorPage />
    </Suspense>
  );
}
