'use client';

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { X, GripVertical, Star } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * ImageUploader Component
 * 
 * Properly handles:
 * - Loading existing images from database (URLs)
 * - Adding new images (files)
 * - Deleting existing images (tracked separately)
 * - Deleting new images (just removes from state)
 * 
 * Props:
 * - value: Array of image objects { url, isNew, id, file? }
 * - onChange: Called with updated array when images change
 * - onDeletedImagesChange: Called with array of deleted existing image URLs
 * - existingImages: Initial array of existing image URLs (for initialization)
 * - maxFiles: Maximum number of images allowed (default: 10)
 * - multiple: Allow multiple image upload (default: true)
 */
export function ImageUploader({ 
  value = [], 
  onChange, 
  onDeletedImagesChange,
  existingImages = [],
  maxFiles = 10,
  multiple = true 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deletedImages, setDeletedImages] = useState([]);
  
  // Initialize with existing images on mount
  useEffect(() => {
    if (existingImages.length > 0 && value.length === 0) {
      const initialImages = existingImages.map((url, idx) => ({
        url: typeof url === 'string' ? url : url?.url || '',
        isNew: false,
        id: `existing-${idx}-${Date.now()}`
      })).filter(img => img.url);
      
      onChange(initialImages);
    }
  }, [existingImages]); // Only run when existingImages prop changes

  const onDrop = useCallback(async (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(
      file => file.size <= MAX_FILE_SIZE && ACCEPTED_TYPES.includes(file.type)
    );

    if (validFiles.length === 0) {
      toast.error('Invalid file(s). Please upload images (JPEG, PNG, WebP) under 5MB.');
      return;
    }

    if (value.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview objects with file references for upload
      const newImages = validFiles.map((file, idx) => ({
        url: URL.createObjectURL(file),
        file: file, // Keep file reference for form submission
        isNew: true,
        id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
      }));

      // Simulate upload progress (remove in production if actual upload is synchronous)
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 20;
        setProgress(Math.min(progressValue, 100));
        if (progressValue >= 100) {
          clearInterval(interval);
        }
      }, 100);

      await new Promise(resolve => setTimeout(resolve, 500));

      onChange([...value, ...newImages]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [value, maxFiles, onChange]);

  const removeImage = useCallback((index) => {
    const imageToRemove = value[index];
    
    if (!imageToRemove) return;

    // If it's an existing image (from database), track it for deletion
    if (!imageToRemove.isNew && imageToRemove.url) {
      const updatedDeleted = [...deletedImages, imageToRemove.url];
      setDeletedImages(updatedDeleted);
      onDeletedImagesChange?.(updatedDeleted);
    }

    // If it's a new image with a blob URL, revoke it to prevent memory leaks
    if (imageToRemove.isNew && imageToRemove.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // Remove from value
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
  }, [value, deletedImages, onChange, onDeletedImagesChange]);

  const moveImage = useCallback((fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    
    const newImages = [...value];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  }, [value, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple,
    disabled: isUploading || value.length >= maxFiles
  });

  // Get files for form submission (only new files)
  const getFilesForUpload = useCallback(() => {
    return value.filter(img => img.isNew && img.file).map(img => img.file);
  }, [value]);

  // Get existing image URLs that are kept (not deleted)
  const getExistingImageUrls = useCallback(() => {
    return value.filter(img => !img.isNew && img.url).map(img => img.url);
  }, [value]);

  // Expose helper methods for parent components
  ImageUploader.getFilesForUpload = getFilesForUpload;
  ImageUploader.getExistingImageUrls = getExistingImageUrls;
  ImageUploader.getDeletedImageUrls = () => deletedImages;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading || value.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading... {Math.round(progress)}%</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive ? (
                'Drop the files here'
              ) : (
                `Drag 'n' drop images here, or click to select files`
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {multiple 
                ? `Up to ${maxFiles} files (max ${MAX_FILE_SIZE / 1024 / 1024}MB each) • ${value.length}/${maxFiles} used`
                : 'Single image upload'}
            </p>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((file, index) => (
            <div key={file.id || index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                <img
                  src={file.url}
                  alt={file.name || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-white/90 text-gray-700 rounded p-1 text-xs hover:bg-white"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {index < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-white/90 text-gray-700 rounded p-1 text-xs hover:bg-white"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                {index === 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                    Cover
                  </span>
                )}
                {file.isNew && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && value.length > 0 && (
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Debug: Image State</summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto">
            {JSON.stringify({
              total: value.length,
              existing: value.filter(i => !i.isNew).length,
              new: value.filter(i => i.isNew).length,
              deleted: deletedImages.length
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Helper hook for forms using ImageUploader
 * 
 * Usage:
 * const { images, setImages, deletedImages, getFormData } = useImageUploader(existingImages);
 * 
 * <ImageUploader 
 *   value={images} 
 *   onChange={setImages}
 *   onDeletedImagesChange={setDeletedImages}
 * />
 */
export function useImageUploader(initialExistingImages = []) {
  const [images, setImages] = useState(() => {
    return initialExistingImages.map((url, idx) => ({
      url: typeof url === 'string' ? url : url?.url || '',
      isNew: false,
      id: `existing-${idx}-${Date.now()}`
    })).filter(img => img.url);
  });
  
  const [deletedImages, setDeletedImages] = useState([]);

  // Prepare data for form submission
  const getFormData = useCallback(() => {
    return {
      // Files to upload
      newFiles: images.filter(img => img.isNew && img.file).map(img => img.file),
      // Existing URLs to keep
      existingUrls: images.filter(img => !img.isNew && img.url).map(img => img.url),
      // URLs to delete from storage
      deletedUrls: deletedImages,
    };
  }, [images, deletedImages]);

  // Reset to initial state
  const reset = useCallback((newExistingImages = []) => {
    setImages(newExistingImages.map((url, idx) => ({
      url: typeof url === 'string' ? url : url?.url || '',
      isNew: false,
      id: `existing-${idx}-${Date.now()}`
    })).filter(img => img.url));
    setDeletedImages([]);
  }, []);

  return {
    images,
    setImages,
    deletedImages,
    setDeletedImages,
    getFormData,
    reset,
  };
}
