import LegalPage from "@/components/legal/LegalPage"
import { cookiePolicyContent } from "@/lib/legal-content"

export default function CookiePage() {
  return <LegalPage title="Cookie Policy" content={cookiePolicyContent} />
}
