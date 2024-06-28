import { db } from '@/lib/db';
import { currentProfile } from '@/lib/current-profile';
import { MemberRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!serverId) {
      return new NextResponse('server Id missing', { status: 400 });
    }

    if (!params.channelId) {
      return new NextResponse('Channel id missing', { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: params.channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    });
    console.log('channel deleted successfully');
    return NextResponse.json(server);
  } catch (error) {
    console.log(['DELETE_CHANNEL_ID'], error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const { name, channelType } = await req.json();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');

    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.channelId) {
      return new NextResponse('Channel id missing', { status: 400 });
    }
    if (!serverId) {
      return new NextResponse('Channel id missing', { status: 400 });
    }

    if (!name || !channelType) {
      return new NextResponse(
        'Please provide a channel name and a channel type',
        { status: 400 }
      );
    }
    if (name === 'general') {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: params?.channelId,
              NOT: {
                name: 'general',
              },
            },
            data: {
              name,
              channelType,
            },
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log(['PATCH_CHANNEL_ID'], error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
