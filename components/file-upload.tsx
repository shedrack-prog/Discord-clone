'use client';

// import '@uploadthing/react/styles.css';
import Image from 'next/image';

import { X } from 'lucide-react';
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
          className="rounded-full w-20 h-20"
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
