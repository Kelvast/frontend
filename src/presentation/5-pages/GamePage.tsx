"use client";
import { FC, memo } from "react";
import GameCanvas from "../3-organisms/GameCanvas";
import BaseLayout from "../4-layouts/BaseLayout";

interface Props {}

const GamePage: FC<Props> = () => (
  <BaseLayout className="bg-black">
    <GameCanvas />
  </BaseLayout>
);

export default memo(GamePage);
