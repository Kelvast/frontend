import { FC, memo } from "react";
import LandingLayout from "../4-layouts/LandingLayout";
import LandingNav from "../3-organisms/LandingNav";
import LandingHero from "../3-organisms/LandingHero";
import LandingAbout from "../3-organisms/LandingAbout";
import LandingFeatures from "../3-organisms/LandingFeatures";
import LandingFooter from "../3-organisms/LandingFooter";

interface Props {}

const HomePage: FC<Props> = () => {
  return (
    <LandingLayout>
      <LandingNav />
      <LandingHero />
      <LandingAbout />
      <LandingFeatures />
      <LandingFooter />
    </LandingLayout>
  );
};

export default memo(HomePage);
