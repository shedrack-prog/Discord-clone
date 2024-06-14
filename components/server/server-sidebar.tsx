import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { ChannelType, MemberRole } from '@prisma/client';
import { redirect } from 'next/navigation';

import ServerHeader from './server-header';
import ServerSearch from './server-search';
import ServerSection from './server-section';

import { Hash, Mic, ShieldCheck, Video } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ServerChannel from './server-channel';

interface ServerSideProps {
  serverId: string;
}

const ServerSidebar = async ({ serverId }: ServerSideProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const server = await db.server?.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      members: {
        include: {
          profile: true,
        },
        orderBy: {
          role: 'asc',
        },
      },
    },
  });

  if (!server) {
    redirect('/');
  }
  const textChannels = server?.channels.filter(
    (channel) => channel.channelType === ChannelType.TEXT
  );
  const audioChannels = server?.channels.filter(
    (channel) => channel.channelType === ChannelType.AUDIO
  );
  const videoChannels = server?.channels.filter(
    (channel) => channel.channelType === ChannelType.VIDEO
  );
  const members = server?.members.filter(
    (member) => member.profileId !== profile.id
  );
  const role = server?.members.find(
    (member) => member.profileId === profile.id
  )?.role;

  const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 w-4 h-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 w-4 h-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 w-4 h-4" />,
  };
  const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: (
      <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
    ),
    [MemberRole.ADMIN]: <ShieldCheck className="h-4 w-4 mr-2 text-rose-500" />,
  };
  return (
    <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <ServerSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.channelType],
                })),
              },
              {
                label: 'Voice Channels',
                type: 'channel',
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.channelType],
                })),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.channelType],
                })),
              },
              {
                label: 'Members',
                type: 'member',
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>

        <Separator className="bg-zinc-200 dark:bg-zinc-700 my-2 rounded-md" />

        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              label="Text Channels"
              channelType={ChannelType.TEXT}
              role={role}
              sectionType="channels"
            />

            {textChannels?.map((channel:any) => (
              <ServerChannel
                key={channel.id}
                channel={channel}
                server={server}
                role={role}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;