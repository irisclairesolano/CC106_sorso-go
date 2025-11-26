'use client';

import { Dialog } from '@headlessui/react';
import { Image as ImageIcon, Search, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

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
  const [selected, setSelected] = useState([...currentSelection]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch media items from your API
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API call
        // const response = await fetch('/api/media');
        // const data = await response.json();
        // setMedia(data);
        
        // Mock data for now
        setTimeout(() => {
          setMedia([
            { id: '1', url: 'https://placehold.co/600x400', name: 'beach.jpg', size: '245 KB', dimensions: '1200x800', type: 'image/jpeg' },
            { id: '2', url: 'https://placehold.co/800x600', name: 'mountain.jpg', size: '512 KB', dimensions: '1920x1080', type: 'image/jpeg' },
            { id: '3', url: 'https://placehold.co/400x600', name: 'waterfall.jpg', size: '310 KB', dimensions: '800x1200', type: 'image/jpeg' },
          ]);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching media:', error);
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, [isOpen]);

  const handleUpload = async (files) => {
    if (!files.length) return;
    
    setUploading(true);
    
    try {
      // Simulate upload progress
      const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
      let uploadedSize = 0;
      
      const uploadPromises = Array.from(files).map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            // In a real app, upload to your storage here
            const interval = setInterval(() => {
              uploadedSize += file.size / 20;
              const progress = Math.min(100, (uploadedSize / totalSize) * 100);
              setUploadProgress(progress);
              
              if (progress >= 100) {
                clearInterval(interval);
                
                const newMedia = {
                  id: `new-${Date.now()}`,
                  url: e.target.result,
                  name: file.name,
                  size: `${(file.size / 1024).toFixed(1)} KB`,
                  type: file.type,
                };
                
                setMedia(prev => [newMedia, ...prev]);
                resolve(newMedia);
              }
            }, 50);
          };
          reader.readAsDataURL(file);
        });
      });
      
      await Promise.all(uploadPromises);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        // Replace with your actual API call to delete
        // await fetch(`/api/media/${id}`, { method: 'DELETE' });
        setMedia(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting media:', error);
      }
    }
  };

  const filteredMedia = media.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (item) => {
    if (multiple) {
      setSelected(prev => 
        prev.some(selectedItem => selectedItem.id === item.id)
          ? prev.filter(selectedItem => selectedItem.id !== item.id)
          : [...prev, item]
      );
    } else {
      setSelected([item]);
    }
  };

  const handleInsert = () => {
    onSelect(multiple ? selected : selected[0]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-5xl bg-white rounded-lg shadow-xl flex flex-col h-[80vh]">
          <Dialog.Title className="flex justify-between items-center p-4 border-b">
            <span className="text-lg font-medium">Media Library</span>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Title>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleUpload(e.target.files)}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {uploading && (
              <div className="px-4 py-2 bg-blue-50">
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-blue-700">Uploading... {Math.round(uploadProgress)}%</p>
              </div>
            )}
            
            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ImageIcon className="h-12 w-12 mb-2 text-gray-300" />
                  <p>No media files found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredMedia.map((item) => {
                    const isSelected = selected.some(selectedItem => selectedItem.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        className={`relative group rounded-lg overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => toggleSelect(item)}
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <img 
                            src={item.url} 
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.size}</p>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            className="p-2 text-white hover:text-red-400 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
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
            
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selected.length} {selected.length === 1 ? 'item' : 'items'} selected
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
