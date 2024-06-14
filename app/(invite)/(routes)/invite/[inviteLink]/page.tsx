import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { RedirectToSignIn, redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface InviteLinkPageProps {
  params: { inviteLink: string };
}

const InviteLinkPage = async ({ params }: InviteLinkPageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return <RedirectToSignIn />;
  }
  if (!params.inviteLink) {
    return redirect('/');
  }

  const AlreadyInServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteLink,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (AlreadyInServer) {
    return redirect(`/servers/${AlreadyInServer.id}`);
  }

  const server = await db.server.update({
    where: {
      inviteCode: params.inviteLink,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id,
          },
        ],
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }
  return null;
};

export default InviteLinkPage;
