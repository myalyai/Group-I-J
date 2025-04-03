'use client';

import { useState } from 'react';
import ModelViewer from '@/components/ModelViewer';

export default function ModelDescriptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Debug: Log auth details (remove in production)
      const authToken = btoa('admin:Group@IJ1');
      console.log('Auth Token:', authToken);
      
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
  
      // Debug: Log response details
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Full Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      const data = await response.json();
      if (data.status) {
        setDescription(data.description);
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">3D Model Description Generator</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".stl"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600"
        />
      </div>

      {file && (
        <div className="mb-4">
          <ModelViewer file={file} onScreenshot={handleScreenshot} />
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4 text-gray-300">
          Generating description...
        </div>
      )}

      {description && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-100">Generated Description:</h2>
          <p className="p-4 bg-gray-800 rounded text-gray-300">{description}</p>
        </div>
      )}
    </div>
  );
}