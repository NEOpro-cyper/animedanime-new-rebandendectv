import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/partials/header/Header";
import Footer from "@/partials/footer/Footer";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserInfoProvider } from "@/context/UserInfoContext";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_KEYWORDS, absoluteUrl, DEFAULT_OG_IMAGE, THEME_COLOR, websiteJsonLd } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });

// ─── Root SEO metadata (inherited by every page) ───
export const metadata = {
  metadataBase: new URL(absoluteUrl("/")),

  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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

  formatDetection: {
    telephone: false,
  },
};

// ─── Viewport / PWA theme ───
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: THEME_COLOR,
  colorScheme: "dark",
};

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserInfoProvider>
          <Header />
          {children}
          <Footer />
        </UserInfoProvider>

        <ToastContainer draggable theme="dark" />

        {/* Structured data: WebSite + SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteJsonLd() }}
        />
      </body>
    </html>
  );
}
