import ContactForm from '@/components/contact/ContactForm';
import { useAuth } from '@/components/providers/AuthProvider';

export default function FluxeditaAdvancedFormSection() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="my-8">
      <ContactForm isAuthenticated={isAuthenticated} user={user} />
    </div>
  );
} 