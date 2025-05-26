
import React from 'react';

interface FileInputProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  isLoading: boolean;
  msg?: string;
}

const FileInput = ({ onFileChange, file, isLoading, msg }: FileInputProps) => {
  return (
    <div>
      <input
        type="file"
        onChange={onFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        accept=".txt,.pdf,.epub"
        disabled={isLoading}
      />
      {file && (
        <p className="mt-2 text-sm text-gray-500">
          Selected file: {file.name} ({file.size} bytes)
        </p>
      )}
      {msg && (
        <p className={`mt-2 text-sm ${msg.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </p>
      )}
    </div>
  );
};

export default FileInput;
