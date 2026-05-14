import type { NextPage } from "next";
import BaseLayout from "../4-layouts/BaseLayout";

interface Props {
  statusCode?: number;
}

const ERROR_FLAVOUR: Record<number, { heading: string; body: string }> = {
  404: {
    heading: "You've wandered off the map.",
    body: "This zone hasn't been discovered yet.",
  },
  403: {
    heading: "Access denied.",
    body: "You don't have the required reputation to enter this area.",
  },
  500: {
    heading: "The server has crashed.",
    body: "Something broke deep in the world engine. Our developers have been sent a message.",
  },
  503: {
    heading: "The world is offline.",
    body: "Kelvast is undergoing emergency maintenance. Check back soon.",
  },
};

const DEFAULT_FLAVOUR = {
  heading: "Something went wrong.",
  body: "An unknown error occurred somewhere in the realm. If this persists, it may be worth filing a bug report.",
};

const ErrorPage: NextPage<Props> = ({ statusCode = 404 }) => {
  const { heading, body } = ERROR_FLAVOUR[statusCode] ?? DEFAULT_FLAVOUR;

  return (
    <BaseLayout centered width="narrow">
      <div className="flex flex-col items-center text-center space-y-6">
        <h1 className="font-heading font-bold text-[12rem] leading-none text-accent drop-shadow-[0_0_60px_rgba(212,146,10,0.25)] select-none">
          {statusCode}
        </h1>

        <div className="w-16 h-px bg-border-strong" />

        <div className="space-y-2">
          <h2 className="font-heading text-2xl text-fg">{heading}</h2>
          <p className="text-fg-muted text-base leading-relaxed max-w-sm">
            {body}
          </p>
        </div>

        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-fg-inverse font-semibold text-sm hover:bg-accent-bright transition-colors"
        >
          ← Return to Home
        </a>
      </div>
    </BaseLayout>
  );
};

export default ErrorPage;
