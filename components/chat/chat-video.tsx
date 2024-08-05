'use client';

import qs from 'query-string';
import { Video, VideoOff } from 'lucide-react';

import ActionTooltip from '@/components/action-tooltip';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export const ChatVideoButton = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isVideo = searchParams?.get('video');

  const Icon = isVideo ? VideoOff : Video;

  const toolTipLabel = isVideo ? 'End video call' : 'Start video call';

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname || '',
        query: {
          video: isVideo ? undefined : true, // Toggle video state
        },
      },
      {
        skipNull: true,
      }
    );

    router.push(url);
  };
  return (
    <ActionTooltip side="bottom" label={toolTipLabel}>
      <button onClick={onClick} className="hover:opacity-75 transition mr-4">
        <Icon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};
