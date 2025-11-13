'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Document, DocumentCategory } from '@/types/bms';

interface EditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSave: (documentId: string, updates: Partial<Document>) => Promise<void>;
}

const EditMetadataModal: React.FC<EditMetadataModalProps> = ({
  isOpen,
  onClose,
  document,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '' as DocumentCategory | '',
    tags: '',
    accessLevel: 'private' as 'public' | 'private' | 'restricted'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (document) {
      // Parse tags from JSON string if needed
      let tagsString = '';
      if (document.tags) {
        try {
          const parsedTags = JSON.parse(document.tags);
          tagsString = Array.isArray(parsedTags) ? parsedTags.join(', ') : '';
        } catch {
          tagsString = document.tags;
        }
      }

      setFormData({
        name: document.name || '',
        category: (document.category as DocumentCategory) || '',
        tags: tagsString,
        accessLevel: document.accessLevel || 'private'
      });
    }
  }, [document]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!document || !formData.name.trim()) {
      setError('Document name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<Document> = {
        name: formData.name.trim(),
        category: formData.category || undefined,
        accessLevel: formData.accessLevel
      };

      // Convert tags to JSON string array
      if (formData.tags?.trim()) {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        updates.tags = JSON.stringify(tagsArray);
      } else {
        updates.tags = undefined;
      }

      await onSave(document.id, updates);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update metadata');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      onClose();
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Edit Metadata</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Document Name */}
          <div>
            <label htmlFor="docName" className="block text-sm font-medium mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              id="docName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter document name"
              maxLength={500}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as DocumentCategory | '' })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              <option value="">Select category</option>
              <option value="contract">Contract</option>
              <option value="financial">Financial</option>
              <option value="technical">Technical</option>
              <option value="legal">Legal</option>
              <option value="hr">HR</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-1">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., important, confidential, review"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Access Level */}
          <div>
            <label htmlFor="accessLevel" className="block text-sm font-medium mb-1">
              Access Level
            </label>
            <select
              id="accessLevel"
              value={formData.accessLevel}
              onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isSubmitting}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* File Info (Read-only) */}
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded space-y-1">
            <div><strong>File Type:</strong> {document.fileType?.toUpperCase() || 'Unknown'}</div>
            <div><strong>Size:</strong> {document.fileSizeBytes ? `${(document.fileSizeBytes / 1024).toFixed(2)} KB` : 'N/A'}</div>
            <div><strong>Uploaded:</strong> {new Date(document.createdAt).toLocaleDateString()}</div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm border rounded-md hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMetadataModal;
