import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import Button from '../Button/Button';

/**
 * Component hiển thị vùng upload + preview ảnh.
 * Có nút X để xoá ảnh giống “Đóng ảnh”.
 */
const ImagePreview = ({ previewUrl, onFileChange, onClear }) => {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-slate-800">
        Ảnh minh họa
      </label>
      {!previewUrl && (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-slate-500 hover:border-primary hover:bg-slate-50">
          <ImageIcon size={28} className="text-slate-400" />
          <div className="text-sm">
            <span className="font-semibold text-slate-800">
              Chọn ảnh
            </span>{' '}
            từ máy tính
          </div>
          <span className="text-xs text-slate-400">
            Hỗ trợ JPG, PNG, WebP. Tối đa 5MB.
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </label>
      )}

      {previewUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/5">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-3 text-xs text-white">
            <span>Ảnh đã chọn</span>
            <Button
              variant="outline"
              size="sm"
              className="border-none bg-white/90 text-slate-800 hover:bg-white"
              type="button"
              onClick={onClear}
            >
              <X size={14} className="mr-1" />
              Đóng ảnh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;