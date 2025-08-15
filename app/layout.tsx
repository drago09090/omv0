import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "OMV Dashboard - Sistema BSS/CRM",
  description:
    "Sistema BSS/CRM profesional para Operador Móvil Virtual. Gestión integral de SIMs, usuarios, clientes, transacciones y reportes.",
  keywords: ["OMV", "BSS", "CRM", "dashboard", "telecomunicaciones", "SIM", "gestión", "operador móvil virtual"],
  authors: [{ name: "OMV System" }],
  creator: "OMV System",
  publisher: "OMV System",
  applicationName: "OMV Dashboard",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://omv-dashboard.com",
    title: "OMV Dashboard - Sistema BSS/CRM",
    description:
      "Sistema BSS/CRM profesional para Operador Móvil Virtual. Gestión integral de SIMs, usuarios, clientes, transacciones y reportes.",
    siteName: "OMV Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OMV Dashboard - Sistema BSS/CRM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OMV Dashboard - Sistema BSS/CRM",
    description: "Sistema BSS/CRM profesional para Operador Móvil Virtual",
    images: ["/og-image.png"],
    creator: "@omv_system",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
