import type { Metadata } from "next"
import LegalPage from "@/components/legal/LegalPage"
import { privacyPolicyContent } from "@/lib/legal-content"

export const metadata: Metadata = {
  title: "Privacy Policy | admin",
  description: "How we collect, use, and protect your personal information",
}

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" content={privacyPolicyContent} />
}
