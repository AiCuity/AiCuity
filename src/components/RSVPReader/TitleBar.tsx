
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ui/theme-toggle";

interface TitleBarProps {
  title: string;
  wordCount: number;
  isFullscreen: boolean;
}

const TitleBar = ({ title, wordCount, isFullscreen }: TitleBarProps) => {
  const navigate = useNavigate();

  if (isFullscreen) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-between p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h2 className="text-lg font-medium truncate max-w-[50%]">{title}</h2>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm">{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
