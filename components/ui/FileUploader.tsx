
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, XIcon } from './Icons';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  if (file) {
    return (
      <div className="mt-2 flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</p>
        <button onClick={() => handleFileChange(null)} className="p-1 text-gray-500 hover:text-red-600">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}
    >
      <div className="space-y-1 text-center">
        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600 dark:text-gray-400">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload a file</span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, AI, PDF up to 10MB</p>
      </div>
    </div>
  );
};

export default FileUploader;