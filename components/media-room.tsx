'use client';

import { useEffect, useState } from 'react';

import { useUser } from '@clerk/nextjs';

import { Loader, Loader2 } from 'lucide-react';

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  StartAudio,
  useTracks,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface MediaRoomProps {
  chatId: string;
  audio: boolean;
  video: boolean;
}

export const MediaRoom = ({ chatId, audio, video }: MediaRoomProps) => {
  const { user } = useUser();
  const [token, setToken] = useState('');

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) return;

    const name = `${user?.firstName} ${user?.lastName}`;

    (async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`
        );

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  if (token === '') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader className="w-7 h-7 my-4 text-zinc-500 animate-spin" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 ">Loading...</p>
      </div>
    );
  }

  return (
    <div className="">
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
        video={video}
        audio={audio}
        style={{ height: '90dvh', zIndex: '100' }}
      >
        <VideoConference />
        <StartAudio label="Join" />

        {/* <MyVideoConference /> */}
        {/* <ControlBar /> */}
      </LiveKitRoom>
    </div>
  );
};

function MyVideoConference() {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );
  return (
    <GridLayout
      tracks={tracks}
      style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}
    >
      {/* The GridLayout accepts zero or one child. The child is used
      as a template to render all passed in tracks. */}
      <ParticipantTile />
    </GridLayout>
  );
}
