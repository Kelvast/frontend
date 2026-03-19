import { FC, memo, PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import BaseLayout from "../4-layouts/BaseLayout";

interface Props {}

const HomePage: FC<Props> = () => {
  return (
    <BaseLayout className="bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="py-20 px-4 text-center">
        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-8">
          Babylon.js MMO
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Next.js + Zustand + Atomic Design port complete. 
          Login to enter the multiplayer world.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          prefetch={false}
        >
          Play Now →
        </Link>
      </div>
    </BaseLayout>
  );
};

export default memo<PropsWithChildren<Props>>(HomePage);
