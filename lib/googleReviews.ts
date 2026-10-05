export type GoogleReview = {
  authorName: string
  authorUrl: string
  rating: number
  relativeTime: string
  text: string
  reviewUrl: string
}

export type GoogleReviewsData = {
  businessName: string
  rating: number
  reviewCount: number
  profileUrl: string
  writeReviewUrl: string
  reviews: GoogleReview[]
}

const PLACE_ID = "ChIJbdxhaOTEDI8RE0BZ85bWi-k"
const PROFILE_URL = "https://maps.google.com/?cid=16828780376416141331"
const WRITE_REVIEW_URL = "https://g.page/r/CRNAWfOW1ovpEAE/review"

const verifiedFallback: GoogleReviewsData = {
  businessName: "Sorted",
  rating: 5,
  reviewCount: 2,
  profileUrl: PROFILE_URL,
  writeReviewUrl: WRITE_REVIEW_URL,
  reviews: [
    {
      authorName: "BodySHARP Studio Fitness Academy",
      authorUrl: "https://www.google.com/maps/contrib/109827470538569350932/reviews",
      rating: 5,
      relativeTime: "September 2026",
      text: "I highly recommend Ronaldo for website design and IT support. What I really appreciated was that I didn’t have to micromanage the process. I could explain what I wanted, give him an idea of the direction, and trust him to use his own expertise to bring it all together. He understands business as well as the technical side of websites, so he was able to take my ideas and turn them into something that actually represents BodySharp Fitness and what we do. If you’re looking for someone who can redesign your website, understand your vision, and also provide reliable IT and website support in the background, Ronaldo is definitely someone I’d recommend.",
      reviewUrl: "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sCi9DQUlRQUNvZENodHljRjlvT2xFdFFrUlBWVzlmZEZCV1MzazVjMVJtUkZCelFXYxAB!2m1!1s0x8f0cc4e46861dc6d:0xe98bd696f3594013",
    },
    {
      authorName: "Savannah Villegas",
      authorUrl: "https://www.google.com/maps/contrib/118010398549769964071/reviews",
      rating: 5,
      relativeTime: "September 2026",
      text: "Wonderful to work with! Easy and quick turnaround for a very professional website. They gave me lots of options and really took the time to understand the look I was going for. Couldn’t have been easier. Thank you!",
      reviewUrl: "https://www.google.com/maps/reviews/data=!4m6!14m5!1m4!2m3!1sCi9DQUlRQUNvZENodHljRjlvT25GT2FHdFhhblpPT1dodk9GVnBPVkYxUzJoNWVGRRAB!2m1!1s0x8f0cc4e46861dc6d:0xe98bd696f3594013",
    },
  ],
}

type PlacesReview = {
  rating?: number
  relativePublishTimeDescription?: string
  text?: { text?: string }
  authorAttribution?: { displayName?: string; uri?: string }
  googleMapsUri?: string
}

type PlacesResponse = {
  displayName?: { text?: string }
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: PlacesReview[]
}

export async function getGoogleReviews(): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  if (!apiKey) return verifiedFallback

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${PLACE_ID}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
    })

    if (!response.ok) return verifiedFallback

    const place = (await response.json()) as PlacesResponse
    const reviews = (place.reviews ?? [])
      .filter((review) => review.text?.text && review.authorAttribution?.displayName)
      .map((review) => ({
        authorName: review.authorAttribution?.displayName ?? "Google reviewer",
        authorUrl: review.authorAttribution?.uri ?? place.googleMapsUri ?? PROFILE_URL,
        rating: review.rating ?? 5,
        relativeTime: review.relativePublishTimeDescription ?? "Google review",
        text: review.text?.text ?? "",
        reviewUrl: review.googleMapsUri ?? place.googleMapsUri ?? PROFILE_URL,
      }))

    if (reviews.length === 0) return verifiedFallback

    return {
      businessName: place.displayName?.text ?? verifiedFallback.businessName,
      rating: place.rating ?? verifiedFallback.rating,
      reviewCount: place.userRatingCount ?? reviews.length,
      profileUrl: place.googleMapsUri ?? PROFILE_URL,
      writeReviewUrl: WRITE_REVIEW_URL,
      reviews,
    }
  } catch {
    return verifiedFallback
  }
}

