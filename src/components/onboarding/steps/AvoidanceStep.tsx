import { motion } from "framer-motion";
import PreferenceCard from "@/components/profile/preferences/PreferenceCard";
import { Shell, Nut, Egg, Leaf, Mushroom, Pepper, Fish, Flame } from "lucide-react";

interface AvoidanceStepProps {
  selected: string[];
  onChange: (items: string[]) => void;
}

const AvoidanceStep = ({ selected, onChange }: AvoidanceStepProps) => {
  const avoidanceItems = [
    { name: "Shellfish", icon: <Shell className="w-5 h-5" /> },
    { name: "Peanuts", icon: <Nut className="w-5 h-5" /> },
    { name: "Tree Nuts", icon: <Nut className="w-5 h-5" /> },
    { name: "Eggs", icon: <Egg className="w-5 h-5" /> },
    { name: "Soy", icon: <Leaf className="w-5 h-5" /> },
    { name: "Mushrooms", icon: <Mushroom className="w-5 h-5" /> },
    { name: "Bell Peppers", icon: <Pepper className="w-5 h-5" /> },
    { name: "Raw Fish", icon: <Fish className="w-5 h-5" /> },
    { name: "Very Spicy", icon: <Flame className="w-5 h-5" /> }
  ];

  const toggleItem = (item: string) => {
    const newSelected = selected.includes(item)
      ? selected.filter(i => i !== item)
      : [...selected, item];
    onChange(newSelected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          Foods to Skip? 🚫
        </h1>
        <p className="text-gray-500">Help us avoid recommending foods you don't enjoy</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {avoidanceItems.map((item) => (
          <PreferenceCard
            key={item.name}
            label={item.name}
            selected={selected.includes(item.name)}
            onClick={() => toggleItem(item.name)}
            icon={item.icon}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AvoidanceStep;