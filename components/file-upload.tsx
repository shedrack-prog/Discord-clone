'use client';

// import '@uploadthing/react/styles.css';
import Image from 'next/image';

import { FileIcon, X } from 'lucide-react';
import { UploadDropzone } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: 'messageFile' | 'serverImage';
}

export const FileUploader = ({
  onChange,
  value,
  endpoint,
}: FileUploaderProps) => {
  const fileType = value.split('.').pop();

  if (value && fileType !== 'pdf') {
    return (
      <div className="relative">
        <Image
          src={value}
          alt="Server Image"
          width={150}
          height={150}
          className="rounded-full w-20 h-20 object-cover"
        />
        <Button
          onClick={() => onChange('')}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm w-6 h-6"
          type="button"
        >
          <X className="" />
        </Button>
      </div>
    );
  }
  if (value && fileType === 'pdf') {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 ">
        <FileIcon className="h-10 w-10 stroke-indigo-400 fill-indigo-200" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <Button
          onClick={() => onChange('')}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm w-6 h-6"
          type="button"
        >
          <X className="" />
        </Button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
};
