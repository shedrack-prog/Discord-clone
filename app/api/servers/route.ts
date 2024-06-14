import { currentProfile } from '@/lib/current-profile';
import { v4 as uuidV4 } from 'uuid';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse('Unauthorized access', { status: 401 });
    }

    const newServer = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidV4(),
        channels: {
          create: [
            {
              name: 'general',
              profileId: profile.id,
            },
          ],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: MemberRole.ADMIN,
            },
          ],
        },
      },
    });
    return NextResponse.json(newServer);
  } catch (error) {
    console.log('[SERVERS_ERROR]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
