export interface SaveSlotSummary {
  slot: number;
  exists: boolean;
  version: number | null;
  label: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SaveSlotRecord extends SaveSlotSummary {
  snapshot: Record<string, unknown> | null;
}

export interface SaveSlotRow {
  user_id: string;
  slot: number;
  version: number;
  label: string | null;
  snapshot_json: Record<string, unknown>;
  created_at: Date | string;
  updated_at: Date | string;
}

