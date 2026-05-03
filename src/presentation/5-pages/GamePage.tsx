"use client";
import { FC, memo, useCallback, useState } from "react";
import GameCanvas from "../3-organisms/GameCanvas";
import GameLoader from "../2-molecules/GameLoader";
import type { LoadEvent, LoadStage } from "../../types/mmo/loading";

/*
 * GamePage owns load state and wires it between GameCanvas and GameLoader.
 * The loader is mounted for its full fade-out even after "connected" so
 * the CSS transition completes before it unmounts.
 */
const DISMISS_DELAY_MS = 700;

const GamePage: FC = () => {
  const [stage, setStage] = useState<LoadStage>("authenticating");
  const [detail, setDetail] = useState<string | undefined>(undefined);
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const onLoadEvent = useCallback((event: LoadEvent) => {
    setStage(event.stage);
    if (event.detail !== undefined) setDetail(event.detail);

    if (event.stage === "connected") {
      // Start fade-out, then unmount after transition completes
      setLoaderVisible(false);
      setTimeout(() => setLoaderMounted(false), DISMISS_DELAY_MS);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <GameCanvas onLoadEvent={onLoadEvent} />
      {loaderMounted && <GameLoader stage={stage} detail={detail} visible={loaderVisible} />}
    </div>
  );
};

export default memo(GamePage);
