"use client";
import { FC, memo, useCallback, useState } from "react";
import GameCanvas from "../3-organisms/GameCanvas";
import GameLoader from "../2-molecules/GameLoader";
import { LOADER } from "../../game-client/constants";
import type { LoadEvent, LoadStage } from "../../types/mmo/loading";

/*
 * GamePage owns load state and wires it between GameCanvas and GameLoader.
 * The loader stays mounted for UNMOUNT_DELAY_MS after "connected" so the
 * CSS fade-out transition fully completes before the DOM node is removed.
 */
const GamePage: FC = () => {
  const [stage, setStage] = useState<LoadStage>("authenticating");
  const [detail, setDetail] = useState<string | undefined>(undefined);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const onLoadEvent = useCallback((event: LoadEvent) => {
    setStage(event.stage);
    if (event.detail !== undefined) setDetail(event.detail);

    if (event.stage === "connected") {
      setLoaderVisible(false);
      setTimeout(() => setLoaderMounted(false), LOADER.UNMOUNT_DELAY_MS);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <GameCanvas onLoadEvent={onLoadEvent} />
      {loaderMounted && (
        <GameLoader stage={stage} detail={detail} visible={loaderVisible} />
      )}
    </div>
  );
};

export default memo(GamePage);
