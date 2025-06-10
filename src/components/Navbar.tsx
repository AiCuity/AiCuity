import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Menu, Crown, Shield, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useSubscriptionQuery } from "@/hooks/useSubscriptionQuery";
import CalibrationButton from "@/components/CalibrationButton";
import SubscribeButton from "@/components/SubscribeButton";

// Import SVG logos
import logoFull from "/assets/logo.svg";
import logoClosed from "/assets/closed.svg";

const Navbar = () => {
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useProfile();
  const { subscription } = useSubscriptionQuery();
  
  // Check if user is truly subscribed
  const isSubscribed = subscription?.status === 'active' && 
                      subscription?.stripe_customer_id && 
                      subscription?.stripe_subscription_id;

  const handleSignOut = () => {
    setIsMobileMenuOpen(false);
    signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-3">
            {/* Desktop Logo - Full logo visible on sm screens and up */}
            <img 
              src={logoFull} 
              alt="AiCuity" 
              className="hidden sm:block h-8 w-auto transition-opacity duration-200 hover:opacity-80" 
            />
            {/* Mobile Logo - Compact logo for small screens */}
            <img 
              src={logoClosed} 
              alt="AiCuity" 
              className="block sm:hidden h-8 w-auto transition-opacity duration-200 hover:opacity-80" 
            />
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Admin Dashboard for admin users */}
              {isAdmin() && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}

              {/* Calibration Dialog */}
              <Dialog open={isCalibrationOpen} onOpenChange={setIsCalibrationOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Calibrate
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

              {/* Account Link */}
              <Link to="/account">
                <Button variant="ghost" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Button>
              </Link>

              {/* Subscribe button for non-subscribers */}
              {!isSubscribed && (
                <SubscribeButton 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  tier="starter"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade
                </SubscribeButton>
              )}

              {/* Sign Out */}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Crown className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <img 
                      src={logoFull} 
                      alt="AiCuity" 
                      className="h-6 w-auto" 
                    />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-4 mt-8">
                  {user ? (
                    <>
                      {/* User info */}
                      <div className="px-4 py-3 rounded-lg bg-muted/50">
                        <p className="text-sm font-medium">Signed in as</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>

                      {/* Admin Dashboard for admin users */}
                      {isAdmin() && (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950">
                            <Shield className="mr-3 h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}

                      {/* Calibration */}
                      <Dialog open={isCalibrationOpen} onOpenChange={setIsCalibrationOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-3 h-4 w-4" />
                            Calibrate Reading
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-[500px] mx-auto">
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

                      {/* Account Link */}
                      <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="mr-3 h-4 w-4" />
                          Your Account
                        </Button>
                      </Link>

                      {/* Subscribe button for non-subscribers */}
                      {!isSubscribed && (
                        <div className="px-1">
                          <SubscribeButton 
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            tier="starter"
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Premium
                          </SubscribeButton>
                        </div>
                      )}

                      {/* Sign Out */}
                      <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={handleSignOut}>
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Sign In */}
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          <User className="mr-3 h-4 w-4" />
                          Sign In
                        </Button>
                      </Link>

                      {/* Create Account */}
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                          <Crown className="mr-2 h-4 w-4" />
                          Create Account
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 