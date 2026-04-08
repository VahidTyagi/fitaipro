import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import HowItWorks from "@/components/marketing/HowItWorks";
import Pricing from "@/components/marketing/Pricing";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}