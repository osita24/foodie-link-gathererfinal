import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    category?: string;
  };
  recommendationScore: number;
}

const MenuItem = ({ item, recommendationScore }: MenuItemProps) => {
  // Extract name from description if it contains a dash
  const hasDetailedDescription = item.description?.includes(" - ");
  const displayName = hasDetailedDescription 
    ? item.description.split(" - ")[0]
    : item.name;
  const displayDescription = hasDetailedDescription
    ? item.description.split(" - ")[1]
    : item.description;

  // Truncate description to ~100 characters while maintaining whole words
  const truncateDescription = (text?: string) => {
    if (!text) return "";
    if (text.length <= 100) return text;
    return text.substr(0, 100).split(" ").slice(0, -1).join(" ") + "...";
  };

  return (
    <div className="group relative p-2 rounded-lg hover:bg-accent/30 transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-secondary group-hover:text-primary transition-colors truncate">
              {displayName}
            </h3>
            {recommendationScore >= 90 && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0">
                <Star className="w-3 h-3 mr-1 inline-block fill-current" />
                Top Pick
              </Badge>
            )}
          </div>
          {displayDescription && (
            <p className="mt-0.5 text-sm text-muted-foreground leading-snug line-clamp-2">
              {truncateDescription(displayDescription)}
            </p>
          )}
          {item.category && (
            <Badge 
              variant="outline" 
              className="mt-1 text-xs bg-transparent border-primary/20 text-primary/70"
            >
              {item.category}
            </Badge>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {item.price && item.price > 0 && (
            <span className="text-base font-medium text-primary whitespace-nowrap">
              ${item.price.toFixed(2)}
            </span>
          )}
          {recommendationScore > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    recommendationScore >= 90 ? "bg-green-500" :
                    recommendationScore >= 80 ? "bg-primary" :
                    "bg-primary/60"
                  )}
                  style={{ width: `${recommendationScore}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {recommendationScore}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;