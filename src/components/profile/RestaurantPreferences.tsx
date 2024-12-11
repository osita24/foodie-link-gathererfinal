import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPreferences, PriceRange } from "@/types/preferences";
import PreferencesProgress from "./preferences/PreferencesProgress";
import PreferencesForm from "./preferences/PreferencesForm";
import PreferencesSaveButton from "./preferences/PreferencesSaveButton";

const defaultPreferences: UserPreferences = {
  cuisinePreferences: [],
  dietaryRestrictions: [],
  foodsToAvoid: [],
  atmospherePreferences: [],
  favoriteIngredients: [],
  favoriteProteins: [],
  spiceLevel: 3,
  priceRange: 'moderate' as PriceRange,
  specialConsiderations: "",
};

const RestaurantPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error("No authenticated user found");
          return;
        }

        console.log("Loading preferences for user:", user.id);
        
        // First check if the user has any preferences
        const { data: existingPrefs, error: checkError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id);

        if (checkError) {
          console.error("Error checking preferences:", checkError);
          throw checkError;
        }

        // If user has preferences, use them
        if (existingPrefs && existingPrefs.length > 0) {
          console.log("Found existing preferences:", existingPrefs[0]);
          setPreferences({
            cuisinePreferences: existingPrefs[0].cuisine_preferences || [],
            dietaryRestrictions: existingPrefs[0].dietary_restrictions || [],
            foodsToAvoid: existingPrefs[0].favorite_ingredients || [],
            atmospherePreferences: existingPrefs[0].atmosphere_preferences || [],
            favoriteIngredients: [],
            favoriteProteins: existingPrefs[0].favorite_proteins || [],
            spiceLevel: existingPrefs[0].spice_level || 3,
            priceRange: existingPrefs[0].price_range || 'moderate',
            specialConsiderations: existingPrefs[0].special_considerations || "",
          });
        } else {
          console.log("No existing preferences found, using defaults");
          setPreferences(defaultPreferences);
        }
      } catch (error) {
        console.error("Error in loadPreferences:", error);
        toast({
          title: "Error",
          description: "Failed to load preferences. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadPreferences();
  }, [toast]);

  useEffect(() => {
    let completed = 0;
    let total = 5;

    if (preferences.cuisinePreferences.length > 0) completed++;
    if (preferences.dietaryRestrictions.length > 0) completed++;
    if (preferences.foodsToAvoid.length > 0) completed++;
    if (preferences.atmospherePreferences.length > 0) completed++;
    if (preferences.favoriteProteins.length > 0) completed++;

    setCompletionPercentage((completed / total) * 100);
  }, [preferences]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

      console.log("Saving preferences for user:", user.id);

      const preferencesData = {
        user_id: user.id,
        cuisine_preferences: preferences.cuisinePreferences,
        dietary_restrictions: preferences.dietaryRestrictions,
        favorite_ingredients: preferences.foodsToAvoid,
        atmosphere_preferences: preferences.atmospherePreferences,
        favorite_proteins: preferences.favoriteProteins,
        special_considerations: preferences.specialConsiderations,
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert(preferencesData);

      if (error) throw error;

      console.log("Preferences saved successfully");
      toast({
        title: "Success! 🎉",
        description: "Your preferences have been saved. We'll use these to find the perfect restaurants for you.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full px-4 md:px-0 md:max-w-3xl mx-auto pb-20">
      <PreferencesProgress completionPercentage={completionPercentage} />
      <PreferencesForm 
        preferences={preferences}
        onChange={setPreferences}
      />
      <PreferencesSaveButton 
        onClick={handleSave}
        disabled={completionPercentage === 0}
        loading={isSaving}
      />
    </div>
  );
};

export default RestaurantPreferences;