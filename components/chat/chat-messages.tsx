'use client';

import { Member, Message, Profile } from '@prisma/client';
import ChatWelcome from './chat-welcome';
import { useChatQuery } from '@/hooks/use-chat-query';
import { Loader2, ServerCrash } from 'lucide-react';
import { Fragment } from 'react';
import ChatItem from './chat-item';

import { format } from 'date-fns';

interface ChatMessagesProps {
  name: string;
  type: 'channel' | 'conversation';
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: 'conversationId' | 'channelId';
  paramValue: string;
}

type MessagesWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};
const DATE_FORMAT = 'd MMM yyyy HH:mm';

const ChatMessages = ({
  name,
  type,
  member,
  chatId,
  apiUrl,
  socketUrl,
  socketQuery,
  paramKey,
  paramValue,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  if (status === 'loading') {
    return (
      <div className="flex flex-1 flex-col justify-center items-center  z-0 ">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4 " />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading messages...
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-1 flex-col justify-center items-center ">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4 " />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Something went wrong!
        </p>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col py-4 overflow-y-auto bottom-0 pt-[15rem] pb-[5rem] ">
      <div className="flex-1" />
      <ChatWelcome type={type} name={name} />

      <div className="flex flex-col-reverse mt-auto">
        {data?.pages?.map((group, index) => (
          <Fragment key={index}>
            {group.items.map((message: MessagesWithMemberWithProfile) => (
              <ChatItem
                id={message.id}
                key={message.id}
                socketUrl={socketUrl}
                currentMember={member}
                member={message.member}
                content={message.content}
                fileUrl={message.fileUrl}
                deleted={message.deleted}
                socketQuery={socketQuery}
                isUpdated={message.updatedAt !== message.createdAt}
                timestamp={format(new Date(message.createdAt), DATE_FORMAT)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default ChatMessages;
