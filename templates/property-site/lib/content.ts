// Content loading utilities for Decap CMS
// All content is loaded from JSON files in /content/

import audiencesContent from "@/content/homepage/audiences.json"
import ctaContent from "@/content/homepage/cta.json"
import heroContent from "@/content/homepage/hero.json"
import trustContent from "@/content/homepage/trust.json"
import contactContent from "@/content/contact/info.json"
import siteSettingsContent from "@/content/site/general.json"
import benefitsContent from "@/content/benefits/list.json"
import aboutContent from "@/content/about/content.json"
import businessStaysContent from "@/content/business-stays/content.json"
import relocationStaysContent from "@/content/relocation-stays/content.json"
import footerContent from "@/content/footer/content.json"

// Icon names from Lucide React
export type IconName =
  | "briefcase"
  | "calendar-check"
  | "check-circle"
  | "home"
  | "map-pin"
  | "shield-check"
  | "users"
  | "wifi"
  | "cooking-pot"
  | "car"
  | "bed-double"
  | "coffee"
  | "message-circle"

// Homepage Types
export type HomepageHero = typeof heroContent
export type HomepageTrust = {
  items: Array<{
    icon: IconName
    title: string
    copy: string
  }>
}
export type HomepageAudiences = {
  eyebrow: string
  heading: string
  items: Array<{
    title: string
    copy: string
    icon: IconName
    href: string
    image: string
  }>
}
export type HomepageCta = typeof ctaContent

// Contact & Site Settings
export type ContactContent = typeof contactContent
export type SiteSettings = typeof siteSettingsContent

// Benefits
export type BenefitsContent = {
  eyebrow: string
  heading: string
  items: Array<{
    title: string
    copy: string
    icon: IconName
  }>
}

// About Page
export type AboutContent = {
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  heroSecondaryText: string
  heroMainImage: string
  heroMainImageAlt: string
  heroInsetImage: string
  heroInsetImageAlt: string
  whoWeHelpHeading: string
  whoWeHelpDescription: string
  includedHeading: string
  includedDescription: string
  includedItems: string[]
  howItWorksHeading: string
  howItWorksDescription: string
  howItWorksSteps: Array<{
    step: string
    title: string
    copy: string
  }>
  ctaHeading: string
  ctaDescription: string
}

// Business Stays Page
export type BusinessStaysContent = {
  heroHeading: string
  heroDescription: string
  heroCtaLabel: string
  whyEyebrow: string
  whyHeading: string
  whyDescription: string
  reasons: Array<{
    icon: IconName
    title: string
    copy: string
  }>
  propertiesEyebrow: string
  propertiesHeading: string
  ctaEyebrow: string
  ctaHeading: string
  ctaDescription: string
}

// Relocation Stays Page
export type RelocationStaysContent = {
  heroHeading: string
  heroDescription: string
  heroCtaLabel: string
  featuresHeading: string
  features: Array<{
    title: string
    copy: string
  }>
  ctaHeading: string
  ctaDescription: string
}

// Footer
export type FooterContent = {
  description: string
  quickLinks: Array<{
    label: string
    href: string
  }>
  credits: string
}

// Loader Functions
export function loadHeroContent(): HomepageHero {
  return heroContent
}

export function loadTrustContent(): HomepageTrust {
  return trustContent as HomepageTrust
}

export function loadAudiencesContent(): HomepageAudiences {
  return audiencesContent as HomepageAudiences
}

export function loadHomepageCta(): HomepageCta {
  return ctaContent
}

export function loadContactContent(): ContactContent {
  return contactContent
}

export function loadSiteSettings(): SiteSettings {
  return siteSettingsContent
}

export function loadBenefitsContent(): BenefitsContent {
  return benefitsContent as BenefitsContent
}

export function loadAboutContent(): AboutContent {
  return aboutContent as AboutContent
}

export function loadBusinessStaysContent(): BusinessStaysContent {
  return businessStaysContent as BusinessStaysContent
}

export function loadRelocationStaysContent(): RelocationStaysContent {
  return relocationStaysContent as RelocationStaysContent
}

export function loadFooterContent(): FooterContent {
  return footerContent as FooterContent
}
