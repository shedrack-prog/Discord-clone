'use client';
import { useModal } from '@/hooks/use-modal-store';
import { Button } from '@/components/ui/button';

import { useState } from 'react';
import axios from 'axios';
import qs from 'query-string';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const DeleteMessageModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'deleteMessage';
  const { apiUrl, query } = data;

  const [loading, setLoading] = useState(false);

  const handleLeaveServer = async () => {
    setLoading(true);
    try {
      const url = qs.stringifyUrl({
        url: apiUrl || '',
        query,
      });

      await axios.delete(url);
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8  px-6">
          <DialogTitle className="font-bold text-2xl text-center">
            Delete Message
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this? <br />
            The message will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full ">
            <Button disabled={loading} variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={loading}
              variant="primary"
              onClick={handleLeaveServer}
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
