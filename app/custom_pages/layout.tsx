import type { Metadata } from "next"
import { Inter } from "next/font/google"
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
      {children}
    </ClientLayout>
  )
}
