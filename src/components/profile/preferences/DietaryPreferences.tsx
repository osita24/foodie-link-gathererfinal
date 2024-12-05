import { Leaf, Apple, Wheat, Ban, Scale, Milk } from "lucide-react";
import PreferenceCard from "./PreferenceCard";

interface DietaryPreferencesProps {
  selected: string[];
  onChange: (restrictions: string[]) => void;
}

const DietaryPreferences = ({ selected, onChange }: DietaryPreferencesProps) => {
  const dietaryPreferences = [
    { name: "Vegetarian", icon: <Leaf /> },
    { name: "Vegan", icon: <Apple /> },
    { name: "Gluten-Free", icon: <Wheat /> },
    { name: "Halal", icon: <Ban /> },
    { name: "Kosher", icon: <Ban /> },
    { name: "Dairy-Free", icon: <Milk /> },
    { name: "Nut-Free", icon: <Ban /> },
    { name: "Low-Carb", icon: <Scale /> },
    { name: "Keto-Friendly", icon: <Scale /> }
  ];

  const toggleDietary = (diet: string) => {
    const newDietary = selected.includes(diet)
      ? selected.filter(d => d !== diet)
      : [...selected, diet];
    onChange(newDietary);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {dietaryPreferences.map((pref) => (
        <PreferenceCard
          key={pref.name}
          label={pref.name}
          selected={selected.includes(pref.name)}
          onClick={() => toggleDietary(pref.name)}
          icon={pref.icon}
        />
      ))}
    </div>
  );
};

export default DietaryPreferences;