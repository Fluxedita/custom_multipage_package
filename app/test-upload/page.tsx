'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus('Please select a file first');
      return;
    }

    setStatus('Uploading...');
    
    try {
      const timestamp = Math.round((new Date).getTime() / 1000);
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
      const publicId = `test_${uuidv4()}`;
      
      // Create signature
      const signature = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp,
          publicId,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        }),
      }).then(res => res.json());

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      setUploadResult(result);
      setStatus('Upload successful!');
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Upload Test</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2 block"
        />
        <button
          onClick={handleUpload}
          disabled={!file}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          Upload Image
        </button>
      </div>

      {preview && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Preview:</h2>
          <img src={preview} alt="Preview" className="max-w-xs max-h-48 object-contain border" />
        </div>
      )}

      {status && (
        <div className="p-4 mb-4 bg-gray-100 rounded">
          {status}
        </div>
      )}

      {uploadResult && (
        <div className="mt-6 p-4 bg-green-50 rounded">
          <h2 className="text-lg font-semibold mb-2">Upload Successful!</h2>
          <p className="text-sm break-all">
            <strong>Public ID:</strong> {uploadResult.public_id}<br />
            <strong>URL:</strong> {uploadResult.secure_url}
          </p>
          {uploadResult.secure_url && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Uploaded Image:</h3>
              <img 
                src={uploadResult.secure_url} 
                alt="Uploaded content" 
                className="max-w-xs max-h-48 object-contain border" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
