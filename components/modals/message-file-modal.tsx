'use client';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/file-upload';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useModal } from '@/hooks/use-modal-store';
import qs from 'query-string';

const formSchema = z.object({
  fileUrl: z.string().min(1, { message: 'Attachment is required.' }),
});

export const MessageFileModal = () => {
  const { data, type, isOpen, onClose } = useModal();
  const { apiUrl, query } = data;
  const isModalOpen = isOpen && type === 'messageFile';
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileUrl: '',
    },
  });

  const isLoading = form.formState.isSubmitting;
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: apiUrl || '',
        query,
      });
      await axios.post(url, {
        ...values,
        content: values.fileUrl,
      });
      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white overflow-hidden p-0 text-black ">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file as a message.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-8">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUploader
                          onChange={field.onChange}
                          value={field.value}
                          endpoint="messageFile"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button variant={'primary'} disabled={isLoading}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
