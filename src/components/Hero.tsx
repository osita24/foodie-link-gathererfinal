import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Sparkles, Utensils } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const Hero = () => {
  const [restaurantUrl, setRestaurantUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) {
        console.log("👤 No user session found");
        return;
      }

      setIsLoadingProfile(true);
      console.log("🔍 Fetching profile for user:", session.user.id);

      try {
        // First, check if profile exists
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (checkError) {
          console.error("❌ Error checking profile:", checkError);
          throw checkError;
        }

        if (!existingProfile) {
          console.log("⚠️ No profile found, creating one...");
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: session.user.id,
              full_name: session.user.email?.split('@')[0] || 'User'
            }]);

          if (insertError) {
            console.error("❌ Error creating profile:", insertError);
            throw insertError;
          }

          setUserName(session.user.email?.split('@')[0] || 'User');
        } else {
          console.log("✅ Profile found:", existingProfile);
          setUserName(existingProfile.full_name || session.user.email?.split('@')[0] || 'User');
        }
      } catch (error: any) {
        console.error("❌ Profile error:", error);
        // Fallback to email username if there's an error
        setUserName(session.user.email?.split('@')[0] || 'User');
        toast.error("Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantUrl) return;

    setIsProcessing(true);
    console.log("🔍 Starting import process for URL:", restaurantUrl);
    
    try {
      if (!restaurantUrl.includes("google.com/maps") && !restaurantUrl.includes("goo.gl")) {
        console.error("❌ Invalid URL format:", restaurantUrl);
        throw new Error("Please enter a valid Google Maps URL");
      }

      console.log("📡 Invoking google-maps-proxy edge function...");
      const { data, error } = await supabase.functions.invoke('google-maps-proxy', {
        body: { 
          url: restaurantUrl.trim()
        }
      });

      console.log("📡 Edge function response:", { data, error });

      if (error) {
        console.error("❌ Edge function error:", error);
        throw new Error(error.message || "Failed to process restaurant URL");
      }

      if (!data?.result?.result?.place_id) {
        console.error("❌ No place_id in response:", data);
        throw new Error("Could not find restaurant information. Please check the URL and try again.");
      }

      const placeId = data.result.result.place_id;
      console.log("✅ Successfully found place ID:", placeId);
      
      toast.success("Restaurant found! Loading details...");
      
      setTimeout(() => {
        navigate(`/restaurant/${placeId}`);
      }, 500);
      
    } catch (error: any) {
      console.error("❌ Import error:", error);
      toast.error(error.message || "Failed to process restaurant URL. Please try again with a valid Google Maps link.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center bg-background px-4 py-12 md:py-20 overflow-hidden">
      <div className="container relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-8 md:space-y-10 text-center">
          {/* Header section with icon */}
          <div className="space-y-6">
            <div className="relative inline-block">
              <div className="absolute -top-8 -right-8 text-primary animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="p-4 bg-primary/10 rounded-full">
                <Utensils className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <div className="space-y-4">
              {session?.user ? (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary font-serif animate-fade-up">
                  {isLoadingProfile ? (
                    <span className="flex items-center justify-center gap-3">
                      Loading... <Loader2 className="w-8 h-8 animate-spin" />
                    </span>
                  ) : (
                    `${getGreeting()}, ${userName}! 👋`
                  )}
                </h1>
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary font-serif animate-fade-up">
                  Find Your Next Favorite Restaurant
                </h1>
              )}
              <p className="text-base sm:text-lg text-muted-foreground/80 animate-fade-up [animation-delay:200ms] max-w-lg mx-auto">
                {session?.user ? "Ready to discover something new?" : "Discover, save, and explore restaurants with ease using Google Maps links"}
              </p>
            </div>
          </div>

          <div className="w-full max-w-xl mx-auto space-y-4 animate-fade-up [animation-delay:400ms]">
            <form onSubmit={handleImport} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-5 w-5 transition-colors group-hover:text-primary" />
                <Input
                  type="url"
                  placeholder="Paste restaurant link..."
                  value={restaurantUrl}
                  onChange={(e) => setRestaurantUrl(e.target.value)}
                  className="h-12 pl-10 text-base shadow-lg transition-all duration-300 border-2 border-accent/50 focus:border-primary/50 hover:border-primary/30 focus:ring-2 focus:ring-primary/20 rounded-xl bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isProcessing || !restaurantUrl}
                className="h-12 px-6 text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl whitespace-nowrap bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </form>
            
            {/* Enhanced tip box */}
            <div className="text-sm text-muted-foreground/70 bg-accent/30 p-4 rounded-xl border border-accent/50 animate-fade-up [animation-delay:600ms] shadow-sm backdrop-blur-sm hover:bg-accent/40 transition-colors duration-300">
              <p className="flex items-center gap-2 justify-center flex-wrap">
                <span className="font-medium text-secondary">💡 Tip:</span>
                Find a restaurant on Google Maps, click Share, and paste the link!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;