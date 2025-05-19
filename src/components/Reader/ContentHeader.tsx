
import React from "react";

interface ContentHeaderProps {
  title: string;
  source: string;
}

const ContentHeader = ({ title, source }: ContentHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
      {source && (
        <a 
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          Source: {source}
        </a>
      )}
    </div>
  );
};

export default ContentHeader;
