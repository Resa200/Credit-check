import LandingHeader from '@/components/landing/LandingHeader'
import HeroSection from '@/components/landing/HeroSection'
import SocialProofStrip from '@/components/landing/SocialProofStrip'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorks from '@/components/landing/HowItWorks'
import PricingSection from '@/components/landing/PricingSection'
import FinalCTA from '@/components/landing/FinalCTA'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <LandingHeader />
      <main>
        <HeroSection />
        <SocialProofStrip />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <FinalCTA />
      </main>
    </div>
  )
}
