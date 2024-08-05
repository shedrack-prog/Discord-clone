import { Hash } from 'lucide-react';
import { MobileToggle } from '@/components/mobile-toggle';
import { UserAvatar } from '@/components/user-avatar';
import { SocketIndicator } from '@/components/socket-indicator';
import { ChatVideoButton } from './chat-video';

interface ChatHeaderProps {
  serverId: string;
  name: string;
  type: 'channel' | 'conversation';
  imageUrl?: string;
}

const ChatHeader = ({ serverId, name, type, imageUrl }: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 z-50 dark:bg-[#313338]   md:left-[320px] right-0 text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
      <MobileToggle serverId={serverId} />

      {type === 'channel' && (
        <Hash className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-400" />
      )}

      {type === 'conversation' && (
        <UserAvatar src={imageUrl} className="h-8 w-8 md:h-8 md:w-8 mr-2" />
      )}
      <p className="font-semibold text-md text-black dark:text-white">{name}</p>

      <div className="ml-auto flex items-center ">
        {type === 'conversation' && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  );
};

export default ChatHeader;
