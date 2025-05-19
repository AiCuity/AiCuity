import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import Hero from "@/components/Hero";
import WebsiteForm from "@/components/WebsiteForm";
import FileUploadForm from "@/components/FileUploadForm";
import ReadingHistory from "@/components/ReadingHistory";
import { useAuth } from "@/context/AuthContext";
import CalibrationButton from "@/components/CalibrationButton";
import ThemeToggle from "@/components/ui/theme-toggle";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Calibration button with Dialog */}
              <Dialog open={isCalibrationOpen} onOpenChange={setIsCalibrationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Calibrate Reading
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Reading Calibration</DialogTitle>
                    <DialogDescription>
                      Calibrate your reading speed to optimize your experience
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <CalibrationButton />
                  </div>
                </DialogContent>
              </Dialog>
              
              <ThemeToggle />
              
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <Hero />
        
        <Card className="w-full max-w-3xl mx-auto mt-8 p-6 shadow-lg">
          <Tabs defaultValue="website" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="website">Website URL</TabsTrigger>
              <TabsTrigger value="upload" onClick={() => setIsUploadOpen(true)}>Upload File</TabsTrigger>
              <TabsTrigger value="history" onClick={() => setIsHistoryOpen(true)}>Reading History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="website">
              <WebsiteForm />
            </TabsContent>
            
            <Dialog open={isUploadOpen && activeTab === "upload"} onOpenChange={setIsUploadOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to start reading with RSVP
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <FileUploadForm />
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isHistoryOpen && activeTab === "history"} onOpenChange={setIsHistoryOpen}>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reading History</DialogTitle>
                  <DialogDescription>
                    View and continue your previous reading sessions
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ReadingHistory />
                </div>
              </DialogContent>
            </Dialog>
            
            <TabsContent value="upload">
              <div className="text-center py-8">
                <p>Please select the Upload File tab to upload documents</p>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="text-center py-8">
                <p>Please select the Reading History tab to view your history</p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>SpeedRead - Powered by RSVP (Rapid Serial Visual Presentation)</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
