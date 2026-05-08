import { Instagram, Facebook, Camera, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Gallery | Gracie Barra Halesowen",
  description: "View photos from Gracie Barra Halesowen. Training sessions, competitions, academy events, and community highlights.",
}

// Instagram-style gallery grid images
const galleryImages = [
  { src: "/gbhalesowen/gi-bjj.jpg", alt: "Gi training session", category: "training" },
  { src: "/gbhalesowen/nogi-bjj.jpg", alt: "No-gi training", category: "training" },
  { src: "/gbhalesowen/kids-jits.jpg", alt: "Kids class", category: "kids" },
  { src: "/gbhalesowen/girls-bjj.jpg", alt: "Female training", category: "female" },
  { src: "/gbhalesowen/daytime-warriors.jpg", alt: "Daytime warriors", category: "training" },
  { src: "/gbhalesowen/functional-fitness_1.jpg", alt: "Functional fitness", category: "fitness" },
  { src: "/gbhalesowen/functional-fitness_2.jpg", alt: "Fitness training", category: "fitness" },
  { src: "/gbhalesowen/functional-fitness_3.jpg", alt: "Gym area", category: "facilities" },
  { src: "/gbhalesowen/functional-fitness_5.jpg", alt: "Weight training", category: "fitness" },
  { src: "/gbhalesowen/functional-fitness_6.jpg", alt: "Cardio equipment", category: "facilities" },
  { src: "/gbhalesowen/functional-fitness_8.jpg", alt: "Training equipment", category: "facilities" },
  { src: "/gbhalesowen/functional-fitness_14.jpg", alt: "Gym space", category: "facilities" },
]

// Simulated Instagram feed posts
const instagramPosts = [
  { 
    type: "image", 
    src: "/gbhalesowen/gi-bjj.jpg", 
    caption: "Fundamentals class working hard tonight! 🥋💪",
    likes: 47,
    comments: 8,
    date: "2 days ago"
  },
  { 
    type: "image", 
    src: "/gbhalesowen/kids-jits.jpg", 
    caption: "Our young champions building confidence and discipline 🌟",
    likes: 62,
    comments: 12,
    date: "4 days ago"
  },
  { 
    type: "image", 
    src: "/gbhalesowen/functional-fitness_1.jpg", 
    caption: "Strength training session tonight. Push your limits! 🔥",
    likes: 38,
    comments: 5,
    date: "1 week ago"
  },
  { 
    type: "image", 
    src: "/gbhalesowen/girls-bjj.jpg", 
    caption: "Ladies night every Wednesday. All women welcome! 💪",
    likes: 54,
    comments: 9,
    date: "1 week ago"
  },
  { 
    type: "image", 
    src: "/gbhalesowen/nogi-bjj.jpg", 
    caption: "No-gi Thursday nights. Different game, same passion 🌊",
    likes: 41,
    comments: 6,
    date: "2 weeks ago"
  },
  { 
    type: "image", 
    src: "/gbhalesowen/functional-fitness_5.jpg", 
    caption: "New equipment added to the functional fitness area! 🏋️",
    likes: 73,
    comments: 15,
    date: "2 weeks ago"
  },
]

const categories = [
  { id: "all", label: "All Photos" },
  { id: "training", label: "Training" },
  { id: "kids", label: "Kids" },
  { id: "female", label: "Female" },
  { id: "fitness", label: "Functional Fitness" },
  { id: "facilities", label: "Facilities" },
]

export default function GalleryPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#001D58]">
        <img
          src="/gbhalesowen/girls-bjj.jpg"
          alt="Gallery at Gracie Barra Halesowen"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,29,88,0.95)_0%,rgba(0,29,88,0.85)_50%,rgba(0,29,88,0.7)_100%)]" />
        
        <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12">
          <div className="max-w-3xl text-white">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#C8102E]">
              Photo Gallery
            </p>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.92] tracking-tight">
              Life on the mats.
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-white/85">
              Training sessions, competitions, and community moments at Gracie Barra Halesowen.
            </p>
          </div>
        </div>
      </section>

      {/* Social Media Links Bar */}
      <section className="border-b border-black/10 bg-white px-5 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-[#4B5563]">
            Follow us for daily updates and behind-the-scenes content
          </p>
          <div className="flex items-center gap-3">
            <a 
              href="https://www.instagram.com/graciebarrahalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              <Instagram className="size-4" />
              @gbhalesowen
            </a>
            <a 
              href="https://www.facebook.com/GracieBarraHalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              <Facebook className="size-4" />
              GB Halesowen
            </a>
          </div>
        </div>
      </section>

      {/* Instagram-Style Feed Section */}
      <section className="bg-[#F4F7FC] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
                <Instagram className="size-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#002F86]">Latest from Instagram</h2>
                <p className="text-sm text-[#4B5563]">@graciebarrahalesowen</p>
              </div>
            </div>
            <a 
              href="https://www.instagram.com/graciebarrahalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden items-center gap-1 text-sm font-bold text-[#C8102E] hover:underline sm:flex"
            >
              View on Instagram
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          {/* Instagram Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {instagramPosts.map((post, idx) => (
              <div 
                key={idx} 
                className="group relative aspect-square cursor-pointer overflow-hidden border border-black/10 bg-white"
              >
                <img
                  src={post.src}
                  alt={post.caption}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="line-clamp-3 text-center text-xs font-medium text-white">
                    {post.caption}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/80">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                  <span className="mt-2 text-[10px] text-white/60">{post.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <a 
              href="https://www.instagram.com/graciebarrahalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#C8102E] hover:underline"
            >
              View on Instagram
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Photo Gallery Grid */}
      <section className="bg-white px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#002F86]">Academy Gallery</h2>
            <p className="mt-2 text-sm text-[#4B5563]">Training, facilities, and community</p>
          </div>

          {/* Category Filter - Static for now, could be made interactive */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  cat.id === "all" 
                    ? "bg-[#002F86] text-white" 
                    : "border border-black/10 bg-white text-[#4B5563] hover:border-[#002F86] hover:text-[#002F86]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Masonry-style Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryImages.map((image, idx) => (
              <div 
                key={idx} 
                className={`group relative overflow-hidden border border-black/10 ${
                  idx === 0 || idx === 6 ? "aspect-[4/3]" : "aspect-square"
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Category badge */}
                <div className="absolute left-3 top-3">
                  <span className="rounded bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {image.category}
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="text-sm font-semibold text-white">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facebook Section */}
      <section className="bg-[#003384] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#1877F2] px-4 py-2 text-sm font-bold">
                <Facebook className="size-4" />
                Facebook
              </div>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight">
                Join our community on Facebook
              </h2>
              <p className="mt-4 max-w-lg text-base font-medium leading-7 text-white/75">
                Get updates on class changes, events, seminars, and academy news. 
                Connect with fellow members and stay part of the conversation.
              </p>
              
              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <a 
                  href="https://www.facebook.com/GracieBarraHalesowen/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 bg-[#1877F2] px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#166fe5] active:translate-y-0"
                >
                  Like our page
                  <ExternalLink className="size-4" />
                </a>
                <Link
                  href="/gbhalesowen#contact"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/80 px-6 py-4 text-sm font-extrabold uppercase tracking-[0.05em] text-white transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#002F86] active:translate-y-0"
                >
                  Get in touch
                </Link>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 p-6">
              {/* Facebook feed preview - replace with real feed when admin access available */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="grid size-10 place-items-center rounded-full bg-[#1877F2]">
                    <span className="text-lg font-bold text-white">GB</span>
                  </div>
                  <div>
                    <p className="font-bold">Gracie Barra Halesowen</p>
                    <p className="text-xs text-white/60">2 hrs ago</p>
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed text-white/85">
                  Great turnout for our Saturday morning open mat! 🥋 
                  Nothing beats the energy of the team training together. 
                  Next open mat is tomorrow at 12pm - all levels welcome!
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <img src="/gbhalesowen/gi-bjj.jpg" alt="Training" className="aspect-video rounded object-cover" />
                  <img src="/gbhalesowen/daytime-warriors.jpg" alt="Team" className="aspect-video rounded object-cover" />
                </div>
                <div className="flex items-center gap-4 pt-2 text-xs text-white/60">
                  <span>👍 124 likes</span>
                  <span>💬 18 comments</span>
                  <span>🔄 8 shares</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#C8102E] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1400px] text-center">
          <Camera className="mx-auto size-10" />
          <h2 className="mt-4 text-2xl font-extrabold">
            Want to be featured?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base font-medium leading-7 text-white/85">
            Tag us in your training photos with @gbhalesowen and #GracieBarraHalesowen 
            for a chance to be featured on our social media and website.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a 
              href="https://www.instagram.com/graciebarrahalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="grid size-10 place-items-center rounded-full bg-white text-[#C8102E] transition-transform hover:scale-110"
            >
              <Instagram className="size-5" />
            </a>
            <a 
              href="https://www.facebook.com/GracieBarraHalesowen/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="grid size-10 place-items-center rounded-full bg-white text-[#C8102E] transition-transform hover:scale-110"
            >
              <Facebook className="size-5" />
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
