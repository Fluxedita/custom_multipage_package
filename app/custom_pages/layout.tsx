import type { Metadata } from "next"
import "@/app/globals.css"
import { ClientLayout } from "../client-layout"

export const metadata: Metadata = {
  title: "Custom Page",
  description: "Custom page content",
}

export default function CustomPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout>
      <main className="min-h-[calc(100vh-64px)] pt-16 md:pt-20">
        {children}
      </main>
    </ClientLayout>
  )
}
