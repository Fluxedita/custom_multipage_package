"use client"

import React from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { ProfileEditProvider } from "@/components/profile/ProfileEditContext"
import { CloudinaryProvider } from "@/components/cloudinary/CloudinaryProvider"
import { Providers } from "@/components/providers"
import { EditModeProvider } from "@/hooks/EditModeContext"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <EditModeProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Providers>
          <ProfileEditProvider>
            <CloudinaryProvider>
              {children}
            </CloudinaryProvider>
          </ProfileEditProvider>
        </Providers>
      </ThemeProvider>
    </EditModeProvider>
  )
}
