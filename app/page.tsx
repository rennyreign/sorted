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
      {/* Hidden form for Netlify build-time detection */}
      <form name="mockup-request" netlify-honeypot="bot-field" data-netlify="true" hidden>
        <input type="hidden" name="form-name" value="mockup-request" />
        <input name="bot-field" />
        <input name="email" type="email" />
        <input name="websiteUrl" type="text" />
        <textarea name="businessDescription" />
      </form>
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
