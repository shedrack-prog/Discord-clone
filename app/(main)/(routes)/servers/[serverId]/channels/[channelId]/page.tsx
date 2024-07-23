import ChatHeader from '@/components/chat/chat-header';
import ChatInput from '@/components/chat/chat-input';
import ChatMessages from '@/components/chat/chat-messages';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  if (!channel) {
    return redirect('/');
  }
  if (!member) {
    return redirect('/');
  }
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col">
      <ChatHeader
        type="channel"
        serverId={channel.serverId}
        name={channel.name}
      />

      <ChatMessages
        name={channel.name}
        type="channel"
        member={member}
        chatId={channel.id}
        apiUrl="/api/messages"
        socketUrl="/api/socket/messages"
        socketQuery={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
        paramKey="channelId"
        paramValue={channel.id}
      />
      <ChatInput
        name={channel.name}
        type="channel"
        query={{
          channelId: channel.id,
          serverId: channel.serverId,
        }}
        apiUrl="/api/socket/messages"
      />
    </div>
  );
};

export default ChannelIdPage;
