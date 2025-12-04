
'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Crop as CropIcon, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageEditorProps {
  image: string | null;
  onClose: () => void;
  onSave: (croppedImage: string) => void;
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): string {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return canvas.toDataURL('image/jpeg');
}

export function ImageEditor({ image, onClose, onSave }: ImageEditorProps) {
  const [crop, setCrop] = useState<Crop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
     const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect || 16 / 9,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }

  const handleSave = () => {
    if (imgRef.current && crop) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      onSave(croppedImageUrl);
    }
  };

  const aspectRatios = [
    { name: '16:9', value: 16 / 9 },
    { name: '4:3', value: 4 / 3 },
    { name: '1:1', value: 1 },
    { name: 'Original', value: undefined },
  ];

  return (
    <Dialog open={!!image} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[3fr,1fr] gap-6 p-4">
            <div className="bg-muted rounded-md flex items-center justify-center p-2 max-h-[60vh]">
                {image && (
                    <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={aspect}
                    >
                    <img
                        ref={imgRef}
                        src={image}
                        alt="Crop preview"
                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                        onLoad={onImageLoad}
                        className="max-h-[55vh] object-contain"
                    />
                    </ReactCrop>
                )}
            </div>
            <div className="space-y-6">
                <div>
                    <Label className="mb-2 block">Aspect Ratio</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {aspectRatios.map(ratio => (
                             <Button
                                key={ratio.name}
                                variant={aspect === ratio.value ? 'secondary' : 'outline'}
                                onClick={() => setAspect(ratio.value)}
                                className="w-full"
                            >
                                {ratio.name}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="zoom">Zoom</Label>
                    <div className="flex items-center gap-2">
                        <ZoomOut className="h-5 w-5" />
                        <Slider
                            id="zoom"
                            min={0.5}
                            max={3}
                            step={0.1}
                            value={[scale]}
                            onValueChange={(value) => setScale(value[0])}
                        />
                        <ZoomIn className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <CropIcon className="mr-2 h-4 w-4" />
            Apply & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
