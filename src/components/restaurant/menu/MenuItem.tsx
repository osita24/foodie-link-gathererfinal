import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { MenuItemMatchBadge } from "./MenuItemMatchBadge";
import { MenuItemDescription } from "./MenuItemDescription";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    description?: string;
    category?: string;
  };
  matchDetails: {
    score: number;
    reason?: string;
    warning?: string;
    matchType?: 'perfect' | 'good' | 'neutral' | 'warning';
  } | null;
  isTopMatch?: boolean;
}

const MenuItem = ({ item, matchDetails, isTopMatch }: MenuItemProps) => {
  const cleanName = item.name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .split(' - ')[0];

  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const getMatchStyle = (matchType: string = 'neutral') => {
    const baseStyle = isTopMatch 
      ? "border-2 border-primary shadow-lg bg-primary/5"
      : "border-l-4 hover:bg-gray-50/50";

    switch (matchType) {
      case 'perfect':
        return cn(baseStyle, isTopMatch ? "" : "border-emerald-400 bg-gradient-to-r from-emerald-50 to-transparent");
      case 'good':
        return cn(baseStyle, isTopMatch ? "" : "border-blue-400 bg-gradient-to-r from-blue-50 to-transparent");
      case 'warning':
        return cn(baseStyle, isTopMatch ? "" : "border-red-400 bg-gradient-to-r from-red-50 to-transparent");
      default:
        return cn(baseStyle, isTopMatch ? "" : "border-gray-200");
    }
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md animate-fade-in-up min-h-[120px] flex flex-col",
        getMatchStyle(matchDetails?.matchType)
      )}
    >
      {isTopMatch && (
        <div className="absolute -top-2 -right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg animate-bounce">
          Top Match
        </div>
      )}
      
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h3 className="text-base font-medium text-gray-900 break-words flex-1 min-w-[200px]">
            {cleanName}
          </h3>
          
          {matchDetails && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="shrink-0">
                    <MenuItemMatchBadge 
                      score={matchDetails.score}
                      matchType={matchDetails.matchType}
                      isTopMatch={isTopMatch}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-64 p-3">
                  <div className="space-y-2">
                    <Progress value={matchDetails.score} className="h-2" />
                    <p className="text-sm font-medium">
                      {matchDetails.score}% Match Score
                    </p>
                    {matchDetails.reason && (
                      <p className="text-xs text-gray-500">
                        {matchDetails.reason}
                      </p>
                    )}
                    {matchDetails.warning && (
                      <p className="text-xs text-red-500">
                        {matchDetails.warning}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        {description && <MenuItemDescription description={description} />}
        
        {matchDetails && (matchDetails.reason || matchDetails.warning) && (
          <div className="flex items-center gap-2 flex-wrap mt-3 animate-fade-in-up">
            {matchDetails.matchType !== 'warning' && matchDetails.reason && (
              <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-xs">
                {matchDetails.reason} ✨
              </Badge>
            )}
            {matchDetails.matchType === 'warning' && matchDetails.warning && (
              <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50 text-xs">
                {matchDetails.warning} ⚠️
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItem;