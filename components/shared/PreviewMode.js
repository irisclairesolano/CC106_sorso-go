'use client';

import { Dialog } from '@headlessui/react';
import { ExternalLink, Eye, Monitor, Smartphone, Tablet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function PreviewMode({ content, isOpen = false, onClose, previewUrl, title = 'Preview' }) {
  const [device, setDevice] = useState('desktop');
  const [isLoading, setIsLoading] = useState(true);
  
  const deviceSizes = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' },
  };

  const deviceIcons = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset loading state when dialog is closed to ensure consistent UI on next open
      setIsLoading(true);
      return;
    }

    if (content) {
      setIsLoading(false);
    }
  }, [content, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-7xl bg-white rounded-lg shadow-xl flex flex-col h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
              <Dialog.Title className="text-lg font-medium flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-500" />
                {title}
              </Dialog.Title>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                {deviceIcons.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDevice(id)}
                    className={`p-2 rounded-md ${device === id ? 'bg-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                    title={label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open in new tab
                </a>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 bg-gray-50 flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div 
                className={`bg-white shadow-lg overflow-auto ${device !== 'desktop' ? 'border border-gray-200' : ''}`}
                style={{
                  width: deviceSizes[device].width,
                  height: deviceSizes[device].height,
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                {content ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No content to preview
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button 
              variant="default"
              onClick={() => {
                // Handle publish/save action
                onClose();
              }}
            >
              Publish Changes
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Hook to manage preview state
export function usePreview() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewTitle, setPreviewTitle] = useState('Preview');
  const [previewUrl, setPreviewUrl] = useState('');

  const openPreview = (content, title = 'Preview', url = '') => {
    setPreviewContent(content);
    setPreviewTitle(title);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    // Small delay to allow the dialog to close before clearing content
    setTimeout(() => {
      setPreviewContent('');
      setPreviewTitle('Preview');
      setPreviewUrl('');
    }, 300);
  };

  const PreviewComponent = () => (
    <PreviewMode 
      isOpen={isPreviewOpen}
      onClose={closePreview}
      content={previewContent}
      title={previewTitle}
      previewUrl={previewUrl}
    />
  );

  return { 
    isPreviewOpen, 
    openPreview, 
    closePreview, 
    PreviewComponent,
    previewContent,
    setPreviewContent
  };
}
