
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, CheckCircle, XCircle } from "lucide-react";
import Hero from "@/components/Hero";
import WebsiteForm from "@/components/WebsiteForm";
import FileUploadForm from "@/components/FileUploadForm";
import ReadingHistory from "@/components/ReadingHistory";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuth } from "@/context/AuthContext";
import CalibrationButton from "@/components/CalibrationButton";
import ThemeToggle from "@/components/ui/theme-toggle";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { user, signOut } = useAuth();

  // Check URL parameters for success/cancel messages
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const canceled = urlParams.get('canceled');
  
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

        {/* Success/Cancel messages */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Subscription successful! Welcome to premium features.
            </AlertDescription>
          </Alert>
        )}
        
        {canceled && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <XCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Subscription was canceled. You can try again anytime.
            </AlertDescription>
          </Alert>
        )}
        
        <Hero />

        {/* Subscription CTA for logged-in users */}
        {user && (
          <Card className="w-full max-w-3xl mx-auto mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-4">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  Unlock Premium Features
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  Subscribe to upload unlimited documents and access advanced reading features
                </p>
              </div>
              <SubscribeButton 
                priceId="price_1234567890" // Replace with your actual Stripe price ID
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Crown className="mr-2 h-4 w-4" />
                Subscribe Now
              </SubscribeButton>
            </div>
          </Card>
        )}
        
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
          <p>AiCuity - Speed Reading Technology</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
