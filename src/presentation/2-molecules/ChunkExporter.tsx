"use client";

import { FC, memo, useState } from "react";
import { BuilderSaveRequest } from "../../types";
import { generateChunkTs } from "../../utils/chunk-export";
import SectionLabel from "../1-atoms/SectionLabel";
import AddUpdateButton from "../1-atoms/AddUpdateButton";
import SaveStatus, { SaveState } from "../1-atoms/SaveStatus";
import { ChunkData } from "mmo-shared";

interface Props {
  chunkData: ChunkData;
  regionId: string;
  previousRegionId: string;
  isNew: boolean;
  onSaved: () => void;
}

const ChunkExporter: FC<Props> = ({ chunkData, regionId, previousRegionId, isNew, onSaved }) => {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSave(): Promise<void> {
    setSaveState("saving");
    const body: BuilderSaveRequest = {
      regionId,
      previousRegionId: previousRegionId !== regionId ? previousRegionId : undefined,
      chunkX: chunkData.chunkX,
      chunkZ: chunkData.chunkZ,
      tiles: chunkData.tiles,
      pvp: chunkData.pvp,
    };

    try {
      const res = await fetch("/api/builder/chunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2000);
        onSaved();
      } else {
        const { error } = await res.json();
        setErrorMessage(error ?? "Unknown error");
        setSaveState("error");
      }
    } catch {
      navigator.clipboard.writeText(generateChunkTs(chunkData));
      setErrorMessage("API unavailable - copied to clipboard");
      setSaveState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Export</SectionLabel>
      <p className="text-xs text-gray-500">
        {regionId}/{chunkData.chunkX}-{chunkData.chunkZ}.ts
      </p>
      <AddUpdateButton isNew={isNew} saveState={saveState} onSave={handleSave} />
      <SaveStatus state={saveState} error={errorMessage} />
    </div>
  );
};

export default memo(ChunkExporter);
