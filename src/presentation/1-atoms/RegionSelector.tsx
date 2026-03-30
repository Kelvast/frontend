"use client";

import { FC, memo, useState } from "react";
import SectionLabel from "./SectionLabel";

interface Props {
  regions: string[];
  value: string;
  onChange: (regionId: string) => void;
  onCreateRegion: (regionId: string) => void;
}

const NEW_REGION = "__new__";

const RegionSelector: FC<Props> = ({ regions, value, onChange, onCreateRegion }) => {
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState("");
  const [error, setError] = useState("");

  function handleSelect(v: string): void {
    if (v === NEW_REGION) {
      setCreating(true);
    } else {
      onChange(v);
    }
  }

  function handleCreate(): void {
    if (!/^[a-z0-9-]+$/.test(newId)) {
      setError("Lowercase letters, numbers and hyphens only");
      return;
    }
    onCreateRegion(newId);
    onChange(newId);
    setCreating(false);
    setNewId("");
    setError("");
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Region</SectionLabel>
      {creating ? (
        <div className="flex flex-col gap-1">
          <input
            autoFocus
            value={newId}
            onChange={(e) => { setNewId(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
            placeholder="region-name"
            className="bg-gray-700 px-2 py-1 rounded text-sm text-white w-full"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-1">
            <button onClick={handleCreate} className="flex-1 bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs">Create</button>
            <button onClick={() => { setCreating(false); setError(""); }} className="flex-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => handleSelect(e.target.value)}
          className="bg-gray-700 px-2 py-1 rounded text-sm text-white w-full"
        >
          {value === "" && <option value="">Select region…</option>}
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          <option value={NEW_REGION}>+ New region</option>
        </select>
      )}
    </div>
  );
};

export default memo(RegionSelector);
