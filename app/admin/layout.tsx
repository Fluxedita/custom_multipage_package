import type React from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import AdminLayoutClient from './admin-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutClient>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AdminLayoutClient>
  )
}
