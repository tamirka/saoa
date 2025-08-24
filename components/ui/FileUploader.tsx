
import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloudIcon, XIcon } from './Icons';

interface FileUploaderProps {
  onFileChange?: (file: File | null) => void; // For single file
  onFilesChange?: (files: File[]) => void;    // For multiple files
  multiple?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange, onFilesChange, multiple = false }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);
  
  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    let newFiles = Array.from(selectedFiles);
    
    if (multiple) {
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      if(onFilesChange) onFilesChange(updatedFiles);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);

    } else {
      const singleFile = newFiles[0];
      setFiles([singleFile]);
      if(onFileChange) onFileChange(singleFile);

      previews.forEach(url => URL.revokeObjectURL(url)); // clear old preview
      setPreviews([URL.createObjectURL(singleFile)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    URL.revokeObjectURL(previews[indexToRemove]);
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    if (multiple && onFilesChange) {
      onFilesChange(updatedFiles);
    } else if (!multiple && onFileChange) {
      onFileChange(null);
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  if (files.length > 0) {
    return (
      <div className="mt-2 space-y-2">
        {previews.map((previewUrl, index) => (
          <div key={index} className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <img src={previewUrl} alt="preview" className="h-10 w-10 rounded object-cover" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{files[index]?.name}</p>
            </div>
            <button type="button" onClick={() => removeFile(index)} className="p-1 text-gray-500 hover:text-red-600">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        {multiple && (
           <label htmlFor="file-upload" className="relative cursor-pointer w-full flex justify-center px-6 py-3 border-2 border-dashed rounded-md transition-colors border-gray-300 dark:border-gray-600 hover:border-indigo-500">
            <span className="text-sm font-medium text-indigo-600">Add more files</span>
             <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple={multiple} onChange={(e) => handleFiles(e.target.files)} />
           </label>
        )}
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
          <label htmlFor="file-upload-main" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload {multiple ? 'files' : 'a file'}</span>
            <input 
              id="file-upload-main" 
              name="file-upload" 
              type="file" 
              multiple={multiple}
              className="sr-only" 
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
};

export default FileUploader;
