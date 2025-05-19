
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { GaugeCircle } from "lucide-react";
import Hero from "@/components/Hero";
import WebsiteForm from "@/components/WebsiteForm";
import FileUploadForm from "@/components/FileUploadForm";
import ReadingHistory from "@/components/ReadingHistory";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/calibration">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <GaugeCircle className="h-4 w-4" />
                  Calibration Test
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          ) : (
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
          )}
        </div>
        
        <Hero />
        
        <Card className="w-full max-w-3xl mx-auto mt-8 p-6 shadow-lg">
          <Tabs defaultValue="website" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="website">Website URL</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="history">Reading History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="website">
              <WebsiteForm />
            </TabsContent>
            
            <TabsContent value="upload">
              <FileUploadForm />
            </TabsContent>
            
            <TabsContent value="history">
              <ReadingHistory />
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
