import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import HowItWorks from "@/components/HowItWorks"
import Services from "@/components/Services"
import Pricing from "@/components/Pricing"
import IntakeAgent from "@/components/IntakeAgent"
import Trust from "@/components/Trust"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <HowItWorks />
      <Services />
      <Pricing />
      <IntakeAgent />
      <Trust />
      <Footer />
    </main>
  )
}
