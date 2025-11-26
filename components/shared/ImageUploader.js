'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUploader({ 
  value = [], 
  onChange, 
  maxFiles = 10,
  multiple = true 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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
      // Simulate upload - replace with your actual upload logic
      const uploadPromises = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // In a real app, upload to your storage here
            setTimeout(() => {
              resolve({
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                type: file.type,
              });
            }, 1000);
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      onChange([...value, ...uploadedFiles]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [value, maxFiles, onChange]);

  const removeImage = (index) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple,
    disabled: isUploading || value.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isUploading || value.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Uploading... {Math.round(progress)}%</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600">
              {isDragActive ? (
                'Drop the files here'
              ) : (
                `Drag 'n' drop images here, or click to select files`
              )}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {multiple 
                ? `Up to ${maxFiles} files (max ${MAX_FILE_SIZE / 1024 / 1024}MB each)`
                : 'Single image upload'}
            </p>
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={file.url}
                  alt={file.name || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
