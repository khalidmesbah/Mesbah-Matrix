'use client';

import InfinityLoader from '@/components/infinity-loader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { AmiriFont, AmiriQuranFont } from '@/lib/fonts/fonts';
import { getWidgetData, setWidgetData } from '@/lib/server-actions/widgets';
import { AyahWidgetFontT, AyahWidgetT } from '@/lib/types/widgets';
import { cn } from '@/lib/utils';
import { DialogClose } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const DEFAULT_AYAH_DATA: AyahWidgetT = {
  text: 'بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ',
  font: '__className_af25f8',
};

export default function Ayah({
  id = 'none',
  isAuthenticated,
}: {
  id?: string;
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [localAyahData, setLocalAyahData] = useState<AyahWidgetT>(DEFAULT_AYAH_DATA);
  const [text, setText] = useState(DEFAULT_AYAH_DATA.text);
  const [font, setFont] = useState(DEFAULT_AYAH_DATA.font);

  const queryClient = useQueryClient();
  const {
    data: queryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ayah', id],
    queryFn: () => getWidgetData(id) as Promise<AyahWidgetT>,
    enabled: isAuthenticated,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: async (newWidgetData: AyahWidgetT) => setWidgetData(id, newWidgetData),
    onMutate: async (ayah) => {
      await queryClient.cancelQueries({ queryKey: ['ayah', id] });

      const previousAyah = queryClient.getQueryData(['ayah', id]);

      queryClient.setQueryData(['ayah', id], (old: AyahWidgetT) => {
        const newAyah = structuredClone(old);
        newAyah.text = ayah.text;
        newAyah.font = ayah.font;
        return newAyah;
      });

      return { previousAyah };
    },
    onError: (_err, _old, context) => {
      queryClient.setQueryData(['ayah', id], context?.previousAyah);
      toast.error(`oops, something went wrong while saving the ayah`);
    },
    onSuccess: (_newData) => {
      toast.success('The ayah been saved successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ayah', id] });
    },
  });

  // Use either the query data or local state depending on whether there's a user

  const handleData = () => {
    if (isAuthenticated) {
      mutation.mutate({ text, font });
    } else {
      setLocalAyahData({ text, font });
    }
  };

  if ((isAuthenticated && isLoading) || (isLoading && !queryData)) return <InfinityLoader />;
  if (isAuthenticated && error) return <div>Error: {error.message}</div>;
  const data = isAuthenticated ? (queryData as AyahWidgetT) : localAyahData;

  return (
    <>
      <p
        className={cn(
          `break-words rounded-md bg-card px-2 text-center text-2xl/[3rem] ${
            data.font === '__className_af25f8' ? AmiriQuranFont.className : AmiriFont.className
          }`,
          {
            'pb-4 pt-6': data.font === '__className_a12e74',
            'pb-6 pt-4': data.font === '__className_af25f8',
          },
        )}
        dir="rtl"
        lang="ar"
      >
        {data.text}
      </p>
      <div className="absolute bottom-1 left-1 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Text and Font</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Arabic Text</Label>
                <Textarea
                  id="text"
                  dir="rtl"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="space-y-2">
                <Label>Font Style</Label>
                <RadioGroup
                  value={font}
                  onValueChange={(value) => setFont(value as AyahWidgetFontT)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="__className_af25f8" id="quran" />
                    <Label htmlFor="quran" className="font-normal">
                      Amiri Quran
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="__className_a12e74" id="regular" />
                    <Label htmlFor="regular" className="font-normal">
                      Amiri Regular
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <DialogClose asChild>
                <Button onClick={handleData}>Save</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
