import AnimatedBenefits from '@/components/members/AnimatedBenefits';

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Membership Packages</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Choose the membership that fits you best. Unlock exclusive content, behind-the-scenes access, and VIP perks by upgrading your plan!
      </p>
      <AnimatedBenefits />
    </div>
  );
} 