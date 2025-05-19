
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Hero from "@/components/Hero";
import WebsiteForm from "@/components/WebsiteForm";
import FileUploadForm from "@/components/FileUploadForm";
import ReadingHistory from "@/components/ReadingHistory";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
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
