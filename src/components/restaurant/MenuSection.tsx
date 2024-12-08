import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { List, Loader2 } from "lucide-react";
import { MenuCategory } from "@/types/restaurant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MenuItem from "./menu/MenuItem";
import MenuHeader from "./menu/MenuHeader";
import MatchScoreCard from "./MatchScoreCard";
import { useRestaurantMatch } from "@/hooks/useRestaurantMatch";
import UnauthenticatedState from "../auth/UnauthenticatedState";
import { useLocation } from "react-router-dom";

interface MenuSectionProps {
  menu?: MenuCategory[];
  photos?: string[];
  reviews?: any[];
  menuUrl?: string;
}

const MenuSection = ({ menu, photos, reviews, menuUrl }: MenuSectionProps) => {
  const [processedMenu, setProcessedMenu] = useState<MenuCategory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const { categories } = useRestaurantMatch(null);
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check and set initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("🔐 Auth state changed in MenuSection:", session?.user?.id);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (menu) {
      console.log("Using provided menu data:", menu);
      setProcessedMenu(menu);
    } else if (menuUrl || photos?.length || reviews?.length) {
      console.log("Processing available data:", {
        menuUrl: menuUrl || 'none',
        photos: photos?.length || 0,
        reviews: reviews?.length || 0
      });
      processRestaurantData();
    } else {
      console.log("No data available to process");
    }
  }, [menu, photos, reviews, menuUrl]);

  const processRestaurantData = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting menu processing");
      
      const { data, error } = await supabase.functions.invoke('menu-processor', {
        body: { 
          menuUrl,
          photos,
          reviews
        }
      });

      if (error) {
        console.error("Error processing data:", error);
        throw error;
      }

      console.log("Response from menu processor:", data);
      
      if (!data?.menuSections?.length) {
        console.log("No menu sections generated");
        toast.info("Could not generate menu information");
        return;
      }

      console.log("Menu sections generated:", data.menuSections);
      setProcessedMenu(data.menuSections);
      toast.success(`Found ${data.menuSections[0].items.length} menu items`);
      
    } catch (error) {
      console.error("Error processing restaurant data:", error);
      toast.error("Failed to generate menu information");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const loadMatchDetails = async () => {
      if (!processedMenu?.[0]?.items || !session?.user) return;

      const details: Record<string, any> = {};
      
      for (const item of processedMenu[0].items) {
        try {
          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (!preferences) {
            details[item.id] = { score: 75 };
            continue;
          }

          const { data, error } = await supabase.functions.invoke('menu-processor', {
            body: { 
              action: 'analyze-item',
              item,
              preferences
            }
          });

          if (error || !data) {
            console.error("Error analyzing item:", error);
            details[item.id] = { score: 75 };
            continue;
          }

          details[item.id] = data;
        } catch (error) {
          console.error("Error getting match details:", error);
          details[item.id] = { score: 75 };
        }
      }

      setItemMatchDetails(details);
    };

    loadMatchDetails();
  }, [processedMenu, session]);

  if (isProcessing) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-secondary text-lg font-medium">
            Processing Menu...
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Analyzing available information to create your digital menu
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!processedMenu || processedMenu.length === 0) {
    return (
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <List className="w-8 h-8 text-muted-foreground mb-4" />
          <p className="text-secondary text-lg font-medium">
            Menu Not Available
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            We're working on getting the latest menu information.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <UnauthenticatedState 
        title="Get Personalized Menu Recommendations"
        description="Sign up to see which menu items match your taste preferences and dietary requirements. We'll analyze each dish and provide personalized recommendations just for you."
        onAuthClick={() => {
          // Store the current location for redirect after onboarding
          localStorage.setItem('redirectAfterAuth', location.pathname);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MatchScoreCard categories={categories} />
      <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-none shadow-lg">
        <CardContent className="p-0">
          <div className="relative">
            <MenuHeader menuUrl={menuUrl} />
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {processedMenu[0].items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    matchDetails={itemMatchDetails[item.id] || { score: 75 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenuSection;