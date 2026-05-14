import { FC, memo } from "react";
import LandingNav from "../3-organisms/Nav";
import LandingHero from "../3-organisms/Hero";
import LandingAbout from "../3-organisms/About";
import LandingFeatures from "../3-organisms/Features";
import LandingFooter from "../3-organisms/Footer";
import BaseLayout from "../4-layouts/BaseLayout";

const HomePage: FC = () => {
  return (
    <BaseLayout>
      <LandingNav />
      <LandingHero />
      <LandingAbout />
      <LandingFeatures />
      <LandingFooter />
    </BaseLayout>
  );
};

export default memo(HomePage);
