import { useState } from "react";
import { ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, Sparkles, ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

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
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanName = item.name
    .replace(/^\d+\.\s*/, '')
    .replace(/\*\*/g, '')
    .split(' - ')[0];

  const description = item.name.includes(' - ') 
    ? item.name.split(' - ')[1].replace(/\*\*/g, '').trim()
    : item.description;

  const isLongDescription = description && description.length > 100;
  const displayDescription = isExpanded ? description : description?.substring(0, 100);

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

  const getScoreColor = (matchType: string = 'neutral') => {
    switch (matchType) {
      case 'perfect':
        return "text-emerald-700 bg-emerald-100";
      case 'good':
        return "text-blue-700 bg-blue-100";
      case 'warning':
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getMatchLabel = (matchType: string = 'neutral') => {
    if (isTopMatch) return "TOP MATCH! 👑";
    switch (matchType) {
      case 'perfect':
        return "PERFECT MATCH! 🎯";
      case 'good':
        return "GREAT CHOICE 👍";
      case 'warning':
        return "HEADS UP ⚠️";
      default:
        return "POSSIBLE MATCH 🤔";
    }
  };

  const getMatchIcon = (matchType: string = 'neutral') => {
    if (isTopMatch) return <Crown className="w-3 h-3 ml-1 text-primary animate-bounce" />;
    switch (matchType) {
      case 'perfect':
        return <Sparkles className="w-3 h-3 ml-1" />;
      case 'good':
        return <ThumbsUp className="w-3 h-3 ml-1" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 ml-1" />;
      default:
        return <ArrowRight className="w-3 h-3 ml-1" />;
    }
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg transition-all duration-300",
        "hover:shadow-md animate-fade-in-up",
        getMatchStyle(matchDetails?.matchType)
      )}
    >
      {isTopMatch && (
        <div className="absolute -top-2 -right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg animate-bounce">
          Top Match
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-base font-medium text-gray-900">
              {cleanName}
            </h3>
            
            {matchDetails && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      className={cn(
                        "animate-fade-in-up cursor-help transition-colors",
                        getScoreColor(matchDetails.matchType)
                      )}
                    >
                      {getMatchLabel(matchDetails.matchType)}
                      {getMatchIcon(matchDetails.matchType)}
                    </Badge>
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
          
          {description && (
            <div className="mt-1">
              <p className="text-sm text-gray-500 leading-relaxed">
                {displayDescription}
                {isLongDescription && !isExpanded && "..."}
              </p>
              {isLongDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Show more <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}
          
          {matchDetails && (matchDetails.reason || matchDetails.warning) && (
            <div className="flex items-center gap-2 flex-wrap animate-fade-in-up">
              {matchDetails.matchType !== 'warning' && matchDetails.reason && (
                <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                  {matchDetails.reason} ✨
                </Badge>
              )}
              {matchDetails.matchType === 'warning' && matchDetails.warning && (
                <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                  {matchDetails.warning} ⚠️
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;