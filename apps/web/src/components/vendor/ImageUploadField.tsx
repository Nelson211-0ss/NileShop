import { useRef, useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { uploadApi } from '@/lib/marketplaceApi';
import { extractApiError } from '@/lib/apiErrors';

export interface UploadedImage {
  path: string;
  url: string;
}

interface ImageUploadFieldProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}

export function ImageUploadField({ value, onChange, max = 10 }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const list = Array.from(files).slice(0, max - value.length);
      const form = new FormData();
      list.forEach((file) => form.append('files[]', file));
      form.append('folder', 'products');
      const res = await uploadApi.images(form);
      const uploaded = (res.data ?? []) as UploadedImage[];
      onChange([...value, ...uploaded].slice(0, max));
    } catch (err) {
      setError(extractApiError(err, 'Failed to upload images.'));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = (path: string) => onChange(value.filter((img) => img.path !== path));

  const makeCover = (path: string) => {
    const index = value.findIndex((img) => img.path === path);
    if (index <= 0) return;
    const next = [...value];
    const [selected] = next.splice(index, 1);
    onChange([selected, ...next]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {value.map((img, index) => (
          <div key={img.path} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
            <img src={img.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                Cover
              </span>
            )}
            <div className="absolute right-1 top-1 flex flex-col gap-1">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(img.path)}
                  className="rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Set as cover image"
                  title="Set as cover"
                >
                  <Star className="h-3 w-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(img.path)}
                className="rounded-full bg-black/60 p-0.5 text-white"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Upload className="mb-1 h-4 w-4" />
            <span className="text-[10px]">{uploading ? 'Uploading…' : 'Add photos'}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        Up to {max} images. The first photo is shown on product cards — use the star to change the cover.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
