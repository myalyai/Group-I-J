'use client';

import { useState } from 'react';
import ModelViewer from '@/components/ModelViewer';
import KeywordsResult from '@/components/KeywordsResult';

export default function UploadSTLPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.toLowerCase().endsWith('.stl')) {
      setFile(selectedFile);
    } else {
      alert('Please select a valid STL file');
    }
  };

  const handleScreenshot = async (base64Image: string) => {
    setIsLoading(true);
    try {
      const base64Data = base64Image.split(',')[1];
      
      const authToken = btoa('admin:Group@IJ1');
      
      const response = await fetch('https://myalyai.app.n8n.cloud/webhook/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify({
          base_64_image: base64Data
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      if (data.status) {
        setDescription(data.description);
        await generateKeywords(data.description);
      } else {
        throw new Error(data.message || 'Failed to generate description');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      alert('Failed to generate description. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateKeywords = async (productDescription: string) => {
    // ... existing generateKeywords function ...
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload STL File</h1>
      
      <div className="mb-4">
        <label htmlFor="stl-file-input" className="block text-sm font-medium text-gray-300 mb-2">
          Upload STL File
        </label>
        <input
          id="stl-file-input"
          type="file"
          accept=".stl"
          onChange={handleFileChange}
          aria-label="Upload STL file"
          title="Choose an STL file to upload"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {/* ... rest of the JSX from model-description page ... */}
    </div>
  );
}