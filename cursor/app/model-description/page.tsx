'use client';

import { useState } from 'react';
import ModelViewer from '@/components/ModelViewer';
import KeywordsResult from '@/components/KeywordsResult';

export default function ModelDescriptionPage() {
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
        // Automatically generate keywords after getting description
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
    setIsGeneratingKeywords(true);
    try {
      const authToken = btoa('admin:Group@IJ1');
      const response = await fetch('https://myalyai.app.n8n.cloud/webhook/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authToken}`
        },
        body: JSON.stringify({
          prompt_id: 2, // Using a default prompt ID for Etsy
          product_description: productDescription,
          session_id: Date.now().toString() // Unique session ID
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate keywords: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status) {
        setKeywords(data.output);
      } else {
        throw new Error(data.message || 'Failed to generate keywords');
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
      alert('Failed to generate keywords. Please try again.');
    } finally {
      setIsGeneratingKeywords(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">3D Model Description Generator</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".stl"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <div className="mb-4">
          <ModelViewer file={file} onScreenshot={handleScreenshot} />
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          Generating description...
        </div>
      )}

      {description && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Generated Description:</h2>
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-gray-200">{description}</p>
          </div>
        </div>
      )}

      {isGeneratingKeywords && (
        <div className="text-center py-4">
          Generating SEO keywords...
        </div>
      )}

      {keywords && (
        <KeywordsResult result={keywords} category="Keywords" />
      )}
    </div>
  );
}