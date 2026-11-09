import React, { useState } from 'react';
import { Plus, X, Star } from 'lucide-react';
import { ASSET_WATCH, ASSET_HEADPHONES, ASSET_BACKPACK, ASSET_LAMP } from '../../store/mockData.ts';

interface ProductImageUploaderProps {
  images: string[];
  thumbnail: string;
  onChange: (images: string[], thumbnail: string) => void;
  error?: string;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  thumbnail,
  onChange,
  error,
}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleAddImageUrl = () => {
    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new Error('Use an HTTP or HTTPS image URL.');
      }
      if (!images.includes(parsed.href)) {
        const updated = [...images, parsed.href];
        onChange(updated, thumbnail || parsed.href);
      }
      setImageUrl('');
      setUrlError('');
    } catch {
      setUrlError('Enter a valid public HTTP or HTTPS image URL.');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, idx) => idx !== indexToRemove);
    const updatedThumbnail = thumbnail === images[indexToRemove] ? updatedImages[0] || '' : thumbnail;
    onChange(updatedImages, updatedThumbnail);
  };

  const handleAddSampleAsset = (assetUrl: string) => {
    if (!images.includes(assetUrl)) {
      const updated = [...images, assetUrl];
      onChange(updated, thumbnail || assetUrl);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Product images</label>
        <span className="text-[11px] text-slate-500">{images.length} {images.length === 1 ? 'image' : 'images'}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddImageUrl();
            }
          }}
          placeholder="https://example.com/product-image.jpg"
          aria-label="Public product image URL"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button type="button" onClick={handleAddImageUrl} className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
          <Plus className="h-3.5 w-3.5" /> Add URL
        </button>
      </div>
      {urlError && <p className="text-xs text-rose-500">{urlError}</p>}
      <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
        <span className="text-[11px] font-medium">Sample assets:</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Watch', url: ASSET_WATCH },
            { label: 'Audio', url: ASSET_HEADPHONES },
            { label: 'Carry', url: ASSET_BACKPACK },
            { label: 'Living', url: ASSET_LAMP },
          ].map((item) => (
            <button key={item.label} type="button" onClick={() => handleAddSampleAsset(item.url)} className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              + {item.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
          {images.map((imgUrl, idx) => {
            const isPrimary = imgUrl === thumbnail;
            return (
              <div key={`${imgUrl}-${idx}`} className={`group relative aspect-4/3 overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-800 ${isPrimary ? 'border-slate-900 ring-2 ring-slate-900/20 dark:border-white' : 'border-slate-200 dark:border-slate-700'}`}>
                <img src={imgUrl} alt={`Product view ${idx + 1}`} className="h-full w-full object-cover" />
                {isPrimary && <span className="absolute left-1.5 top-1.5 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">Cover</span>}
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {!isPrimary && <button type="button" onClick={() => onChange(images, imgUrl)} aria-label="Set primary image" className="rounded bg-white p-1.5 text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" /></button>}
                  <button type="button" onClick={() => handleRemoveImage(idx)} aria-label="Remove image" className="rounded bg-rose-600 p-1.5 text-white"><X className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
