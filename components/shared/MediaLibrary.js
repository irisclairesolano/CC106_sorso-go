'use client';

import { deleteMediaFile, getMediaFiles, uploadMediaFile } from '@/app/actions/media-actions';
import { Dialog } from '@headlessui/react';
import { AlertCircle, Image as ImageIcon, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';

const normalizeSelectionItem = (item, index) => {
  if (!item) return null;
  if (typeof item === 'string') {
    return {
      id: `url-${index}-${item}`,
      url: item,
    };
  }

  if (typeof item === 'object') {
    return {
      ...item,
      id: item.id ?? `selection-${index}-${item.url ?? 'unknown'}`,
    };
  }

  return null;
};

export function MediaLibrary({ 
  isOpen, 
  onClose, 
  onSelect,
  multiple = false,
  currentSelection = []
}) {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSelection = useMemo(() => {
    if (!Array.isArray(currentSelection)) return [];
    return currentSelection
      .map(normalizeSelectionItem)
      .filter(Boolean);
  }, [currentSelection]);

  const [selected, setSelected] = useState(normalizedSelection);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const selectionSignature = useMemo(() => JSON.stringify(normalizedSelection), [normalizedSelection]);

  // Fetch media items from Supabase storage
  const fetchMedia = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await getMediaFiles();
      
      if (result.success) {
        setMedia(result.data || []);
      } else {
        setError(result.error || 'Failed to load media');
        setMedia([]);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err.message || 'Failed to load media');
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    fetchMedia();
  }, [isOpen, fetchMedia]);

  const normalizedSelectionRef = useRef(normalizedSelection);

  useEffect(() => {
    normalizedSelectionRef.current = normalizedSelection;
  }, [normalizedSelection, selectionSignature]);

  useEffect(() => {
    if (!isOpen) return;

    setSelected(normalizedSelectionRef.current);
  }, [isOpen, selectionSignature]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      const fileArray = Array.from(files);
      const totalFiles = fileArray.length;
      let completedFiles = 0;
      const uploadedMedia = [];

      for (const file of fileArray) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          console.warn(`File too large: ${file.name}`);
          continue;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadMediaFile(formData);
        
        if (result.success && result.data) {
          uploadedMedia.push(result.data);
        } else {
          console.error(`Failed to upload ${file.name}:`, result.error);
        }

        completedFiles++;
        setUploadProgress((completedFiles / totalFiles) * 100);
      }

      // Add uploaded files to the media list
      if (uploadedMedia.length > 0) {
        setMedia(prev => [...uploadedMedia, ...prev]);
      }

      if (uploadedMedia.length < fileArray.length) {
        setError(`Uploaded ${uploadedMedia.length} of ${fileArray.length} files`);
      }

    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const result = await deleteMediaFile(item.path);
      
      if (result.success) {
        setMedia(prev => prev.filter(m => m.id !== item.id));
        setSelected(prev => prev.filter(s => s.id !== item.id));
      } else {
        setError(result.error || 'Failed to delete file');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      setError(err.message || 'Failed to delete file');
    }
  };

  const filteredMedia = media.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (item) => {
    if (multiple) {
      setSelected(prev => 
        prev.some(selectedItem => selectedItem.id === item.id || selectedItem.url === item.url)
          ? prev.filter(selectedItem => selectedItem.id !== item.id && selectedItem.url !== item.url)
          : [...prev, item]
      );
    } else {
      setSelected([item]);
    }
  };

  const handleInsert = () => {
    if (multiple) {
      onSelect(selected.map(s => s.url));
    } else {
      onSelect(selected[0]?.url);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 z-[100] bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-auto">
        <Dialog.Panel className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col h-[80vh] pointer-events-auto">
          <Dialog.Title className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <span className="text-lg font-medium">Media Library</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Title>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    className="pl-10 pr-4 py-2 w-full border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchMedia}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleUpload(e.target.files)}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError(null)} 
                  className="ml-auto hover:text-red-900 dark:hover:text-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            {/* Upload progress */}
            {uploading && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            
            {/* Media grid */}
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <ImageIcon className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" />
                  <p className="mb-2">No media files found</p>
                  <p className="text-sm">Upload images to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((item) => {
                    const isSelected = selected.some(selectedItem => selectedItem.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => toggleSelect(item)}
                      >
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <img 
                            src={item.url} 
                            alt={item.name}
                            className="object-cover w-full h-full"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800">
                          <p className="text-sm font-medium truncate dark:text-gray-200">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.size}</p>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            className="p-2 text-white hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <div className="h-4 w-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selected.length} {selected.length === 1 ? 'item' : 'items'} selected
                {media.length > 0 && ` • ${media.length} total`}
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInsert}
                  disabled={selected.length === 0}
                >
                  Insert {selected.length > 0 ? `(${selected.length})` : ''}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
