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
import FileUploadNetlify from "@/components/FileUploadNetlify";
import ReadingHistory from "@/components/ReadingHistory";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuth } from "@/context/AuthContext";
import CalibrationButton from "@/components/CalibrationButton";
import ThemeToggle from "@/components/ui/theme-toggle";
import UsageDisplay from "@/components/UsageDisplay";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  
  // Check if user is truly subscribed
  const isSubscribed = subscription?.status === 'active' && 
                      subscription?.stripe_customer_id && 
                      subscription?.stripe_subscription_id;
  
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
              
              <Link to="/account">
                <Button variant="outline" size="sm">
                  Your Account
                </Button>
              </Link>
              
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

        {/* Usage display for logged-in users */}
        {user && (
          <div className="w-full max-w-3xl mx-auto mt-8">
            <UsageDisplay />
          </div>
        )}

        {/* Subscription CTA for logged-in users who are NOT subscribed */}
        {user && !isSubscribed && (
          <Card className="w-full max-w-3xl mx-auto mt-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-4">
              <Crown className="h-8 w-8 text-purple-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  Unlock Premium Features
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  Subscribe to unlock more books and access advanced reading features
                </p>
              </div>
              <SubscribeButton 
                className="bg-purple-600 hover:bg-purple-700"
                tier="starter"
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
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="history">Reading History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="website">
              <WebsiteForm />
            </TabsContent>
            
            <TabsContent value="upload">
              <section className="rounded border p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Upload Document</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  Upload a document to start reading with RSVP (powered by Netlify Functions)
                </p>
                <FileUploadNetlify />
              </section>
            </TabsContent>
            
            <TabsContent value="history">
              <section className="rounded border p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Reading History</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                  View and continue your previous reading sessions
                </p>
                <ReadingHistory />
              </section>
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
