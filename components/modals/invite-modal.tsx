'use client';
import { useModal } from '@/hooks/use-modal-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useOrigin } from '@/hooks/use-origin';
import { useState } from 'react';
import axios from 'axios';

export const InviteModal = () => {
  const { isOpen, onClose, onOpen, type, data } = useModal();
  const isModalOpen = isOpen && type === 'invite';
  const origin = useOrigin();
  const { server } = data;
  const inviteLink = `${origin}/invite/${server?.inviteCode}`;

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const generateNewLink = async () => {
    setLoading(true);
    try {
      const response = await axios.patch(
        `/api/servers/${server?.id}/invite-link`
      );
      onOpen('invite', { server: response.data });
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
            Invite Friends
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 ">
          <Label className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            Server invite link
          </Label>

          <div className="flex items-center mt-2 gap-x-2">
            <Input
              disabled={loading}
              className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 "
              value={inviteLink}
            />

            <Button disabled={loading} size={'icon'} onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 " />
              ) : (
                <Copy className="w-4 h-4 " />
              )}
            </Button>
          </div>
          <Button
            disabled={loading}
            onClick={generateNewLink}
            size="sm"
            variant="link"
            className="text-xs text-zinc-500 mt-4"
          >
            Generate a new link
            <RefreshCw className="w-4 h-4 ml-2 " />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
