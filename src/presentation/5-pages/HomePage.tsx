import { FC, memo } from "react";
import Link from "next/link";
import BaseLayout from "../4-layouts/BaseLayout";
import Button from "../1-atoms/Button";
import { ROUTE } from "../../config";

interface Props {}

const HomePage: FC<Props> = () => {
  return (
    <BaseLayout centered>
      <div className="text-center">
        <h1 className="font-heading text-5xl md:text-6xl font-black text-[var(--color-text)] mb-4 tracking-tight">
          MMO
        </h1>
        <p className="text-[var(--color-text-muted)] text-base mb-10 leading-relaxed max-w-sm mx-auto">
          A multiplayer world built on Babylon.js, Next.js, and WebSockets. Sign in to enter.
        </p>
        <Link href={ROUTE.LOGIN} prefetch={false}>
          <Button size="lg">Play Now</Button>
        </Link>
      </div>
    </BaseLayout>
  );
};

export default memo(HomePage);
