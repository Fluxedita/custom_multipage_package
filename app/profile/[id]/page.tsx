import { getMemberById } from "@/app/actions/members";
import PublicProfile from "@/components/profile/PublicProfile";
import { notFound } from "next/navigation";

type PublicProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const member = await getMemberById(params.id);

  if (!member) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PublicProfile member={member} />
    </div>
  );
} 