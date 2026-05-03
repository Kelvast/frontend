"use client";
import { FC, memo, useCallback, useState } from "react";
import GameCanvas from "../3-organisms/GameCanvas";
import GameLoader from "../2-molecules/GameLoader";
import type { LoadEvent, LoadStage } from "../../types/mmo/loading";

interface Props {}

const GamePage: FC<Props> = () => {
  const [stage, setStage] = useState<LoadStage>("authenticating");
  const [detail, setDetail] = useState<string | undefined>(undefined);

  const onLoadEvent = useCallback((event: LoadEvent) => {
    setStage(event.stage);
    if (event.detail !== undefined) setDetail(event.detail);
  }, []);

  const loaderVisible = stage !== "connected";

  return (
    <div className="fixed inset-0 bg-black">
      <GameCanvas onLoadEvent={onLoadEvent} />
      {loaderVisible && <GameLoader stage={stage} detail={detail} />}
    </div>
  );
};

export default memo(GamePage);
