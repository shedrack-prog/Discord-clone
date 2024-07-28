'use client';
import { Fragment, useRef, ElementRef } from 'react';

import { Member, Message, Profile } from '@prisma/client';
import ChatWelcome from './chat-welcome';
import { useChatQuery } from '@/hooks/use-chat-query';
import { Loader2, ServerCrash } from 'lucide-react';
import ChatItem from './chat-item';

import { format } from 'date-fns';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useChatScroll } from '@/hooks/use-chat-scroll';

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
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery({
      queryKey,
      apiUrl,
      paramKey,
      paramValue,
    });

  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);

  useChatSocket({ queryKey, addKey, updateKey });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0].items.length ?? 0,
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
    <div className="flex flex-col overflow-y-auto mb-[8rem] mt-[4rem]">
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome type={type} name={name} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4 " />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600  dark:text-zinc-400 text-xs my-4 dark:hover:text-zinc-300 transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}

      <div ref={chatRef} className="flex flex-1 mt-auto flex-col-reverse">
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
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
