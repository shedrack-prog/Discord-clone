import { currentProfilePages } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import { NextApiResponseServerIo } from '@/types';
import { MemberRole } from '@prisma/client';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  try {
    if (req.method !== 'DELETE' && req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const profile = await currentProfilePages(req);

    const { messageId, channelId, serverId } = req.query;
    const { content } = req.body;

    if (!profile) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!serverId) {
      return res.status(404).json({ message: 'Server Id missing' });
    }

    if (!channelId) {
      return res.status(404).json({ message: 'Channel Id missing' });
    }
    if (!messageId) {
      return res.status(404).json({ message: 'message Id missing' });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const serverMember = server.members.find(
      (member) => member.profileId === profile.id
    );
    if (!serverMember) {
      return res.status(404).json({
        message: 'Member not found',
      });
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const isMessageOwner = message.memberId === serverMember.id;
    const isAdmin = serverMember.role === MemberRole.ADMIN;
    const isModerator = serverMember.role === MemberRole.MODERATOR;

    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'DELETE') {
      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          fileUrl: null,
          content: 'This message has been deleted.',
          deleted: true,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    if (req.method === 'PATCH') {
      if (!isMessageOwner) {
        return res.status(401).json({
          message: 'Unauthorized',
        });
      }

      message = await db.message.update({
        where: {
          id: messageId as string,
        },
        data: {
          content,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }
    const updateKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(updateKey, message);
    return res.status(200).json(message);
  } catch (error) {
    console.log('[MESSAGE_PATCH_ID]', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
