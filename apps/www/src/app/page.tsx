import Features from "@/components/sections/features";
import FinalCTA from "@/components/sections/final-cta";
import Footer from "@/components/sections/footer";
import Hero from "@/components/sections/hero";
import HowItWorks from "@/components/sections/how-it-works";
import Problem from "@/components/sections/problem";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <FinalCTA />
      <Footer />
    </main>
  );
}
