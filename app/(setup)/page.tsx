// 'use client';

import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

import { initialProfile } from '@/lib/initial-profile';
import { InitialModal } from '@/components/modals/initial-modal';
import { useEffect, useState } from 'react';

const SetupPage = async () => {
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  // if (!mounted) {
  //   return null;
  // }
  const profile = await initialProfile();

  const server = await db.server.findFirst({
    where: {
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }
  return <InitialModal />;
};

export default SetupPage;
