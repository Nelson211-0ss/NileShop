import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { uploadApi } from '@/lib/marketplaceApi';

export interface UploadedImage {
  path: string;
  url: string;
}

interface ImageUploadFieldProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}

export function ImageUploadField({ value, onChange, max = 5 }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const list = Array.from(files).slice(0, max - value.length);
      const form = new FormData();
      list.forEach((file) => form.append('files[]', file));
      form.append('folder', 'products');
      const res = await uploadApi.images(form);
      const uploaded = (res.data ?? []) as UploadedImage[];
      onChange([...value, ...uploaded].slice(0, max));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (path: string) => onChange(value.filter((img) => img.path !== path));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((img) => (
          <div key={img.path} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(img.path)}
              className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Upload className="h-4 w-4 mb-1" />
            <span className="text-[10px]">{uploading ? '...' : 'Add'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">Up to {max} images. First image is the cover.</p>
    </div>
  );
}
