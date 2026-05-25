# Property Site Template

A Next.js template for short-term property rental/accommodation websites. Built with Decap CMS for easy content management.

## Features

- **CMS-Driven Content:** All content editable via Decap CMS
- **Property Listings:** Full property management with images, amenities, features
- **Multi-Audience Pages:** Dedicated pages for Business Stays, Relocation, Families
- **Direct Enquiry:** Contact forms, phone, WhatsApp integration
- **SEO Optimized:** Next.js App Router with proper metadata
- **Responsive:** Mobile-first design
- **Fast:** Static export for Netlify hosting

## Content Collections

1. **Homepage** - Hero, Trust Strip, Who We Help, CTA
2. **Properties** - Property listings with full details
3. **Benefits** - Why Stay With Us section
4. **About** - About page with team/story content
5. **Business Stays** - Contractor/business traveller focused page
6. **Relocation Stays** - Relocation focused page
7. **Contact** - Contact page with form
8. **Footer** - Footer content and links
9. **Site Settings** - Global phone, email, social links

## Getting Started

1. Clone this template
2. Install dependencies: `npm install`
3. Configure `content/site/general.json` with your details
4. Add your properties to `content/properties/list.json`
5. Update images in `public/`
6. Deploy to Netlify with Git Gateway + Identity

## Customization

- Colors: Edit Tailwind classes in components (brand color: `#139c8b`)
- Fonts: Already set up with system font stack
- Icons: Lucide React icon library
- Images: Add to `public/` folder

## CMS Access

After deployment, access the CMS at `/admin` with Netlify Identity credentials.

## Structure

```
/app           - Next.js app router pages
/components    - React components (Nav, Footer, PropertyCard, etc.)
/lib           - Utilities and content loaders
/content       - JSON content files (CMS-managed)
/public        - Static assets and images
/public/admin  - Decap CMS configuration
```
