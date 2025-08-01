import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClientHeader } from "@/components/ClientHeader"
import { ClientFooter } from "@/components/ClientFooter"
import { ClientLayout } from "./client-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ProfileEditProvider } from "@/components/profile/ProfileEditContext"
import { CloudinaryProvider } from "@/components/cloudinary/CloudinaryProvider"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"
import PageEditFab from "@/components/admin/PageEditFab"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Website Package",
  description: "Fluxedita Editable Website Package",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Merriweather&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>
            <div className="flex flex-col min-h-screen">
              <ClientHeader />
              <main className="flex-grow pt-16 md:pt-20 min-h-[calc(100vh-64px)]">
                {children}
              </main>
              <ClientFooter />
              <Toaster position="top-center" richColors />
              <PageEditFab />
            </div>
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
