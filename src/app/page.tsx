import Preloader from '@/components/Preloader';
import { SoundProvider } from '@/components/ui/SoundToggle';
import NanoStage from '@/components/nano/NanoStage';
import AboutApp from '@/components/sections/AboutApp';
import AboutCreator from '@/components/sections/AboutCreator';
import Categories from '@/components/sections/Categories';
import GameCarousel from '@/components/sections/GameCarousel';
import GameLibrary from '@/components/sections/GameLibrary';
import InstallGuide from '@/components/sections/InstallGuide';
import Screenshots from '@/components/sections/Screenshots';
import SiteFooter from '@/components/sections/SiteFooter';
import SiteNav from '@/components/sections/SiteNav';
import WhySection from '@/components/sections/WhySection';
import Faq from '@/components/sections/Faq';
import DownloadPanel from '@/components/download/DownloadPanel';
import Section from '@/components/ui/Section';
import { APP_NAME } from '@/config/site';

export default function Home() {
  return (
    <SoundProvider>
      <Preloader />
      <SiteNav />

      <main id="top">
        {/* The signature sequence: AJ → nanomachine dispersal → the app. */}
        <NanoStage />

        {/* Everything below sits on the same dark field, so leaving the hero
            feels like moving through one space rather than changing pages. */}
        <div className="relative z-10 bg-void">
          <AboutApp />
          <Categories />
          <GameCarousel />
          <GameLibrary />
          <Screenshots />
          <WhySection />

          <Section
            id="download"
            eyebrow="Get it"
            title="Download for Android"
            lead={`${APP_NAME} is free. The download is a standard Android APK, installed directly rather than through the Play Store.`}
            center
          >
            <div className="mx-auto max-w-2xl">
              <DownloadPanel />
            </div>
          </Section>

          <InstallGuide />
          <Faq />
          <AboutCreator />
        </div>
      </main>

      <SiteFooter />
    </SoundProvider>
  );
}
