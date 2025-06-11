import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import Hero from "@/components/Hero";
import WebsiteForm from "@/components/WebsiteForm";
import FileUploadNetlify from "@/components/FileUploadNetlify";
import ReadingHistory from "@/components/ReadingHistory";
import SubscribeButton from "@/components/SubscribeButton";
import { useAuth } from "@/context/AuthContext";
import UsageDisplay from "@/components/UsageDisplay";
import { useSubscriptionQuery } from "@/hooks/useSubscriptionQuery";
import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";

import MxmcSVG from "/assets/mxmc.svg";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("website");
  const { user } = useAuth();
  const { subscription } = useSubscriptionQuery();

  // Check if user is truly subscribed
  const isSubscribed = subscription?.status === 'active' &&
    subscription?.stripe_customer_id &&
    subscription?.stripe_subscription_id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 md:py-12">
        <Hero />

        {/* Content for non-signed users - New Landing Page */}
        {!user && <LandingPage />}

        {/* Usage display for logged-in users */}
        {user && (
          <div className="w-full max-w-3xl mx-auto mt-6 sm:mt-8">
            <UsageDisplay />
          </div>
        )}

        {/* Subscription CTA for logged-in users who are NOT subscribed */}
        {user && !isSubscribed && (
          <Card className="w-full max-w-3xl mx-auto mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-200">
                  Unlock Premium Features
                </h3>
                <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                  Subscribe to unlock more books and access advanced reading features
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <SubscribeButton
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                  tier="starter"
                >
                  <Crown className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Subscribe Now</span>
                </SubscribeButton>
              </div>
            </div>
          </Card>
        )}

        {/* Logged-in user tabs */}
        {user && (
          <Card className="w-full max-w-3xl mx-auto mt-6 sm:mt-8 p-3 sm:p-6 shadow-lg">
            <Tabs defaultValue="website" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 h-auto">
                <TabsTrigger value="website" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">Website URL</span>
                  <span className="sm:hidden">Website</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">Upload File</span>
                  <span className="sm:hidden">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                  <span className="hidden sm:inline">Reading History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="website">
                <WebsiteForm />
              </TabsContent>

              <TabsContent value="upload">
                <section className="rounded border p-3 sm:p-6 shadow-sm">
                  <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Upload Document</h2>
                  <p className="mb-4 sm:mb-6 text-sm text-muted-foreground">
                    Upload a document to start reading with RSVP (powered by Netlify Functions)
                  </p>
                  <FileUploadNetlify />
                </section>
              </TabsContent>

              <TabsContent value="history">
                <section className="rounded border p-3 sm:p-6 shadow-sm">
                  <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Reading History</h2>
                  <p className="mb-4 sm:mb-6 text-sm text-muted-foreground">
                    View and continue your previous reading sessions
                  </p>
                  <ReadingHistory />
                </section>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-500 px-4">
          <div className="flex flex-col items-center space-y-4">
            {/* Main footer text */}
            <p>AiCuity - Speed Reading Technology</p>
            
            {/* Privacy and Terms links */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/privacy" 
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link 
                to="/terms" 
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            
            {/* MXMC Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Designed by</span>
              <img 
                src={MxmcSVG} 
                alt="MXMC" 
                className="h-4 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
