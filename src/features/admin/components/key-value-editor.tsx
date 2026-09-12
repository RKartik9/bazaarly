"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type KeyValue = { key: string; value: string };

type Props = { value: KeyValue[]; onChange: (next: KeyValue[]) => void; keyPlaceholder?: string; valuePlaceholder?: string };

export function KeyValueEditor({ value, onChange, keyPlaceholder = "Label", valuePlaceholder = "Value" }: Props) {
  const update = (i: number, patch: Partial<KeyValue>) => onChange(value.map((kv, idx) => (idx === i ? { ...kv, ...patch } : kv)));

  return (
    <div className="space-y-2">
      {value.map((kv, i) => (
        <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
          <Input value={kv.key} onChange={(e) => update(i, { key: e.target.value })} placeholder={keyPlaceholder} />
          <Input value={kv.value} onChange={(e) => update(i, { value: e.target.value })} placeholder={valuePlaceholder} />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove row">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, { key: "", value: "" }])}>
        <Plus className="size-3.5" /> Add row
      </Button>
    </div>
  );
}
