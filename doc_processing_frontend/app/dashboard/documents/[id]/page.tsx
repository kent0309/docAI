'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import useAuthStore from '@/lib/store';

// Interfaces for document and extracted data
interface ExtractedData {
  id: number;
  key: string;
  value: string;
  is_validated: boolean;
}

interface Document {
  id: number;
  file: string;
  document_type: string;
  status: string;
  uploaded_at: string;
  extracted_data: ExtractedData[];
}

// Editable field component for extracted data
function EditableField({ 
  data, 
  onSave 
}: { 
  data: ExtractedData;
  onSave: (id: number, value: string, isValidated: boolean) => Promise<void>;
}) {
  const [value, setValue] = useState(data.value);
  const [isValidated, setIsValidated] = useState(data.is_validated);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(data.id, value, isValidated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-md">
      <div className="flex justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{data.key}</label>
        <div className="flex items-center">
          <label className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              className="rounded text-blue-600"
              checked={isValidated}
              onChange={() => setIsValidated(!isValidated)}
              disabled={!isEditing && !isValidated}
            />
            <span className="ml-2 text-sm text-gray-700">Validated</span>
          </label>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="text-xs text-green-600 hover:text-green-800"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setValue(data.value);
                  setIsValidated(data.is_validated);
                  setIsEditing(false);
                }}
                className="text-xs text-red-600 hover:text-red-800"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      ) : (
        <div className="p-2 bg-gray-50 rounded-md">{value}</div>
      )}
    </div>
  );
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await api.get(`/documents/${params.id}/`);
        setDocument(response.data);
      } catch (error: any) {
        console.error('Error fetching document:', error);
        setError(error.response?.data?.detail || 'Failed to load document details.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDocument();
    }
  }, [params.id, isAuthenticated]);

  // Handle saving extracted data
  const handleSaveExtractedData = async (id: number, value: string, isValidated: boolean) => {
    try {
      await api.put(`/extracted_data/${id}/`, {
        value,
        is_validated: isValidated
      });

      // Update local state after successful save
      if (document) {
        setDocument({
          ...document,
          extracted_data: document.extracted_data.map(item => 
            item.id === id ? { ...item, value, is_validated: isValidated } : item
          )
        });
      }
    } catch (error) {
      console.error('Error saving extracted data:', error);
      throw error;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-xl">Loading document details...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render document details
  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Document not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Document header */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-xl font-semibold text-gray-900">Document Details</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Document ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{document.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {document.document_type || 'Unclassified'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    document.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {document.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(document.uploaded_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">File</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a 
                    href={document.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Original Document
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Extracted Data */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Extracted Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review and validate the information extracted from this document.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {document.extracted_data.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No data has been extracted from this document yet.
              </div>
            ) : (
              <div>
                {document.extracted_data.map((data) => (
                  <EditableField 
                    key={data.id} 
                    data={data} 
                    onSave={handleSaveExtractedData} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 