import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Roman Fitness | Premium Gym & Fitness Empire",
    template: "%s | Roman Fitness",
  },
  description:
    "Roman Fitness is the premium gym in Periyanaickenpalayam, Coimbatore. Enter the Roman Empire of Fitness with elite equipment, expert coaching, body transformation programs, and AI diet plans.",
  keywords: [
    "roman fitness",
    "roman fitness gym",
    "best gym in periyanaickenpalayam",
    "premium gym coimbatore",
    "fitness center periyanaickenpalayam",
    "personal training periyanaickenpalayam",
    "body transformation coimbatore",
    "best gym coimbatore",
    "roman prabhur trainer",
    "elite gym periyanaickenpalayam",
  ],
  metadataBase: new URL("https://mfpgympnp.in"),
  alternates: {
    canonical: "https://mfpgympnp.in",
  },
  openGraph: {
    title: "Roman Fitness | Enter The Empire of Fitness",
    description:
      "Premium fitness experience with elite equipment, expert coaching, and cinematic training environment. Enter the Roman Empire of Fitness.",
    url: "https://mfpgympnp.in",
    siteName: "Roman Fitness",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logoroman.png",
        width: 800,
        height: 600,
        alt: "Roman Fitness - Premium Gym & Fitness Empire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roman Fitness | Enter The Empire of Fitness",
    description:
      "Premium fitness experience with elite equipment, expert coaching, and cinematic training environment.",
    images: ["/logoroman.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "fitness",
  icons: {
    icon: "/logoroman.png",
    apple: "/logoroman.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GymOrHealthClub",
  name: "Roman Fitness",
  alternateName: ["Roman Fitness Gym", "Roman Fitness Periyanaickenpalayam", "MFP Gym"],
  description:
    "Roman Fitness is the premium gym and fitness center in Periyanaickenpalayam, Coimbatore. We offer elite training, body transformation programs, AI-powered diet plans, and modern equipment.",
  url: "https://mfpgympnp.in",
  logo: "https://mfpgympnp.in/logoroman.png",
  image: "https://mfpgympnp.in/logoroman.png",
  telephone: "+918098834154",
  email: "mfppnproman@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No 17, Bhagat Singh Nagar",
    addressLocality: "Periyanaickenpalayam",
    addressRegion: "Tamil Nadu",
    postalCode: "641020",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 11.1551686,
    longitude: 76.9505951,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "05:00",
      closes: "23:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "06:00",
      closes: "14:00",
    },
  ],
  priceRange: "$$",
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Razorpay, Online Payment",
  founder: {
    "@type": "Person",
    name: "Roman Prabhur",
    jobTitle: "Head Trainer & Founder",
    sameAs: "https://www.instagram.com/romanprabhur/",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Gym Membership Plans",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Basic Plan",
        description: "3-month gym membership with access to all equipment",
        price: "3099",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        description: "6-month gym membership - most popular plan",
        price: "4699",
        priceCurrency: "INR",
      },
      {
        "@type": "Offer",
        name: "Elite Plan",
        description: "1-year gym membership - best value",
        price: "6699",
        priceCurrency: "INR",
      },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    bestRating: "5",
    worstRating: "1",
    ratingCount: "150",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={cn(inter.variable, bebas.variable, "font-sans antialiased text-white bg-[#0A0A0A]")}>
        {/* Skip-to-content for keyboard / screen-reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-[#E8192B] focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:uppercase focus:tracking-widest"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
