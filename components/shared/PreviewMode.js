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
    // Open preview in a new tab
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} | SORSO-GO</title>
          <style>
            * { box-sizing: border-box; }
            body { 
              margin: 0; 
              padding: 0;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              min-height: 100vh;
            }
            .preview-header {
              background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
              color: white;
              padding: 12px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: sticky;
              top: 0;
              z-index: 100;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            .preview-header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .preview-badge {
              background: rgba(255,255,255,0.2);
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .preview-content {
              max-width: 900px;
              margin: 0 auto;
              padding: 32px 24px;
              background: white;
              min-height: calc(100vh - 52px);
              box-shadow: 0 0 40px rgba(0,0,0,0.08);
            }
            @media (max-width: 768px) {
              .preview-content { padding: 20px 16px; }
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            <h1>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              ${title}
            </h1>
            <span class="preview-badge">Preview Mode</span>
          </div>
          <div class="preview-content">
            ${content}
          </div>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
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
