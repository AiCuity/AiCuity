
interface SourceLinkProps {
  source?: string;
  isFullscreen: boolean;
}

const SourceLink = ({ source, isFullscreen }: SourceLinkProps) => {
  if (!source || isFullscreen) {
    return null;
  }
  
  return (
    <div className="px-4 pb-2 text-center">
      <a 
        href={source} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Source: {source}
      </a>
    </div>
  );
};

export default SourceLink;
