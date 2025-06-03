import React from 'react';

interface FileInputProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  isLoading: boolean;
  msg?: string;
}

const FileInput = ({ onFileChange, file, isLoading, msg }: FileInputProps) => {
  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    
    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    } else if (kb >= 1) {
      return `${kb.toFixed(1)} KB`;
    } else {
      return `${bytes} bytes`;
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        onChange={onFileChange}
        className="block w-full text-sm sm:text-base text-gray-500 
                   file:mr-3 sm:file:mr-4 
                   file:py-2 sm:file:py-3 
                   file:px-3 sm:file:px-4 
                   file:rounded-lg file:border-0 
                   file:text-sm sm:file:text-base file:font-semibold 
                   file:bg-blue-50 file:text-blue-700 
                   hover:file:bg-blue-100 
                   dark:file:bg-blue-900/20 dark:file:text-blue-300
                   file:transition-colors file:cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed"
        accept=".txt,.pdf,.epub"
        disabled={isLoading}
      />
      {file && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
            Selected file: {file.name}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Size: {formatFileSize(file.size)}
          </p>
        </div>
      )}
      {msg && (
        <div className={`mt-2 p-3 rounded-lg text-sm sm:text-base ${
          msg.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' 
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
};

export default FileInput;
