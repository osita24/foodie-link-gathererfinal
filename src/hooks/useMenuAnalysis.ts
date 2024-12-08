import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MenuCategory } from "@/types/restaurant";

export const useMenuAnalysis = (processedMenu: MenuCategory[] | null) => {
  const [itemMatchDetails, setItemMatchDetails] = useState<Record<string, any>>({});
  const [analyzedMenu, setAnalyzedMenu] = useState<MenuCategory[] | null>(null);

  useEffect(() => {
    const analyzeMenuItem = (item: any, preferences: any) => {
      console.log('🔍 Analyzing menu item:', item.name);
      console.log('👤 User preferences:', preferences);
      
      const itemContent = `${item.name} ${item.description || ''}`.toLowerCase();
      let score = 50;
      let reasons: string[] = [];
      let warnings: string[] = [];
      let bonusPoints = 0;

      // Check dietary restrictions (vegetarian specific logic)
      if (preferences.dietary_restrictions?.includes('vegetarian')) {
        const meatKeywords = [
          'chicken', 'beef', 'pork', 'fish', 'seafood', 'lamb', 'turkey',
          'bacon', 'ham', 'sausage', 'prosciutto', 'salami', 'pepperoni'
        ];
        
        const hasMeat = meatKeywords.some(meat => itemContent.includes(meat));

        if (hasMeat) {
          score = 20;
          warnings.push("Contains meat - not suitable for vegetarians");
        } else {
          // Likely vegetarian-friendly
          score += 30;
          reasons.push("Vegetarian-friendly option");
        }
      }

      // Check vegan restrictions
      if (preferences.dietary_restrictions?.includes('vegan')) {
        const nonVeganKeywords = ['cheese', 'cream', 'milk', 'egg', 'butter', 'yogurt', 'mayo'];
        const hasNonVegan = nonVeganKeywords.some(ingredient => itemContent.includes(ingredient));

        if (hasNonVegan) {
          score = 20;
          warnings.push("Contains dairy/eggs - not suitable for vegans");
        } else {
          score += 30;
          reasons.push("Potentially vegan-friendly");
        }
      }

      // Check gluten-free requirements
      if (preferences.dietary_restrictions?.includes('gluten-free')) {
        const glutenKeywords = ['bread', 'pasta', 'flour', 'wheat', 'breaded', 'battered'];
        const hasGluten = glutenKeywords.some(ingredient => itemContent.includes(ingredient));

        if (hasGluten) {
          score = 20;
          warnings.push("Contains gluten - not gluten-free");
        }
      }

      // Check favorite proteins
      const proteinMatches = preferences.favorite_proteins?.filter(
        (protein: string) => itemContent.includes(protein.toLowerCase())
      );
      
      if (proteinMatches?.length > 0) {
        // Only add protein bonus if it doesn't conflict with dietary restrictions
        if (!warnings.length) {
          score += 35;
          bonusPoints += 10;
          reasons.push(`Features your preferred protein: ${proteinMatches[0]}`);
        }
      }

      // Check cuisine preferences
      const cuisineMatches = preferences.cuisine_preferences?.filter(
        (cuisine: string) => itemContent.includes(cuisine.toLowerCase())
      );
      
      if (cuisineMatches?.length > 0) {
        score += 25;
        bonusPoints += 5;
        reasons.push(`Matches ${cuisineMatches[0]} cuisine style`);
      }

      // Check favorite ingredients
      const ingredientMatches = preferences.favorite_ingredients?.filter(
        (ingredient: string) => itemContent.includes(ingredient.toLowerCase())
      );
      
      if (ingredientMatches?.length > 0 && !warnings.length) {
        score += 20;
        bonusPoints += 5;
        reasons.push(`Contains ${ingredientMatches[0]} that you enjoy`);
      }

      // Determine match type based on final score + bonus points
      let matchType: 'perfect' | 'good' | 'neutral' | 'warning' = 'neutral';
      const finalScore = Math.min(100, score + bonusPoints);

      if (finalScore >= 90) matchType = 'perfect';
      else if (finalScore >= 75) matchType = 'good';
      else if (finalScore < 40) matchType = 'warning';

      // If no specific matches or warnings found, add a generic reason
      if (reasons.length === 0 && !warnings.length) {
        reasons.push("Standard menu option");
      }

      console.log(`✨ Analysis result for ${item.name}:`, {
        score: finalScore,
        reasons,
        warnings,
        matchType
      });

      return {
        score: finalScore,
        reason: reasons[0],
        warning: warnings[0],
        matchType
      };
    };

    const loadMatchDetails = async () => {
      if (!processedMenu?.[0]?.items) return;

      const details: Record<string, any> = {};
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        return;
      }

      console.log("Loading preferences for user:", user.id);
      
      try {
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (preferencesError) {
          console.error("Error fetching preferences:", preferencesError);
          throw preferencesError;
        }

        if (!preferences) {
          console.log("No preferences found for user");
          return;
        }

        console.log("Found user preferences:", preferences);

        // Analyze each menu item
        const analyzedItems = processedMenu[0].items.map(item => ({
          ...item,
          analysis: analyzeMenuItem(item, preferences)
        }));

        // Sort items by score
        const sortedItems = analyzedItems.sort((a, b) => {
          const scoreA = a.analysis.score || 0;
          const scoreB = b.analysis.score || 0;
          return scoreB - scoreA;
        });

        // Create match details for each item
        sortedItems.forEach(item => {
          details[item.id] = item.analysis;
        });

        setAnalyzedMenu([{ ...processedMenu[0], items: sortedItems }]);
        setItemMatchDetails(details);

      } catch (error) {
        console.error("Error in loadMatchDetails:", error);
      }
    };

    loadMatchDetails();
  }, [processedMenu]);

  return { itemMatchDetails, analyzedMenu };
};