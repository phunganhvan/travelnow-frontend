import { useState, useCallback } from 'react';

/**
 * Hook quản lý logic chọn ảnh, preview và xóa ảnh.
 * Tách riêng giúp component form gọn, dễ test.
 */
export const useImagePreview = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onFileChange = useCallback((event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Có thể thêm validate kích thước, định dạng tại đây
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Vui lòng chọn ảnh JPG/PNG/WebP');
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  }, []);

  const clearImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    onFileChange,
    clearImage
  };
};