'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  useContentScore,
  useGenerateContentScore,
  useRescoreCategory,
  type ScoreCategory
} from '@/lib/hooks/use-content-score';
import {  AISuggestion } from '@/lib/api/types';
import {
  BarChart3,
  Loader2,
  Sparkles,
  FileText,
  Link2,
  Image,
  Hash,
  Search,
  Target,
  BookOpen,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentScoreCardProps {
  contentId: string;
}

function OverallScoreCircle({ score, level, levelDisplay }: { score: number; level: string; levelDisplay: string }) {
  const getScoreLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'poor':
        return { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      case 'basic':
        return { color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'average':
        return { color: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'good':
        return { color: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      default:
        return { color: '#6b7280', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const colors = getScoreLevelColor(level);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r="45"
            fill="none"
            stroke={colors.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn('text-3xl font-bold', colors.text)}>{score}</div>
          <div className={cn('text-xs font-medium', colors.text, 'opacity-75')}>/100</div>
        </div>
      </div>
      <div className={cn('px-3 py-1 rounded-full text-xs font-semibold border', colors.bg, colors.text, colors.border)}>
        {levelDisplay}
      </div>
    </div>
  );
}

const RESCORE_CATEGORIES = new Set<ScoreCategory>([
  'readability',
  'seo',
  'structure',
  'keywords',
  'links',
  'images',
  'word_count',
]);

type CategoryRescoreLimit = { count: number; remaining: number; max: number };

function ScoreBarChart({
  scores,
  suggestionsByCategory,
  onRescoreCategory,
  rescoringCategory,
  categoryRescoreLimits
}: {
  scores: { name: string; value: number; icon: React.ElementType; category: string }[];
  suggestionsByCategory: Record<string, AISuggestion[]>;
  onRescoreCategory?: (category: ScoreCategory) => void;
  rescoringCategory?: ScoreCategory | null;
  categoryRescoreLimits?: Partial<Record<ScoreCategory, CategoryRescoreLimit>>;
}) {
  const getColor = (value: number) => {
    if (value >= 80) return '#22c55e'; // green
    if (value >= 60) return '#eab308'; // yellow
    if (value >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
      case 'medium':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertCircle };
      case 'low':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Info };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: Info };
    }
  };

  const normalizeCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'readability': 'readability',
      'seo': 'seo',
      'structure': 'structure',
      'keyword': 'keywords',
      'keywords': 'keywords',
      'links': 'links',
      'images': 'images',
      'word_count': 'word_count',
      'word count': 'word_count'
    };
    return categoryMap[category.toLowerCase()] || category.toLowerCase();
  };

  return (
    <div className="space-y-4">
      {scores.map((item) => {
        const Icon = item.icon;
        const color = getColor(item.value);
        const categoryKey = normalizeCategory(item.category);
        const categorySuggestions = suggestionsByCategory[categoryKey] || [];
        const canRescore = RESCORE_CATEGORIES.has(categoryKey as ScoreCategory);
        const rescoreLimit = categoryRescoreLimits?.[categoryKey as ScoreCategory];
        const usesLeft = rescoreLimit?.remaining ?? rescoreLimit?.max ?? 3;
        const limitReached = usesLeft <= 0;

        return (
          <div key={item.name} className="space-y-2">
            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                  <span className="font-medium text-gray-700">{item.name}</span>
                  {canRescore && onRescoreCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px] shrink-0"
                      onClick={() => onRescoreCategory(categoryKey as ScoreCategory)}
                      disabled={rescoringCategory === categoryKey || limitReached}
                      title={
                        limitReached
                          ? `All 3 ${item.name} re-scores have been used`
                          : `${usesLeft} of 3 re-scores remaining`
                      }
                    >
                      {rescoringCategory === categoryKey ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : limitReached ? (
                        'Limit reached'
                      ) : (
                        <>
                          Re-score
                          <span className="ml-1 text-gray-500">({usesLeft})</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <span className="font-semibold text-gray-900 shrink-0">{item.value}/100</span>
              </div>
              <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>

            {/* Category-specific Suggestions */}
            {categorySuggestions.length > 0 && (
              <div className="ml-5 space-y-1.5 border-l-2 border-gray-200 pl-3">
                {categorySuggestions.map((suggestion, index) => {
                  const priorityColors = getPriorityColor(suggestion.priority);
                  const PriorityIcon = priorityColors.icon;

                  return (
                    <div
                      key={index}
                      className={cn(
                        'rounded-md border p-2 text-xs',
                        priorityColors.bg,
                        priorityColors.border
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <PriorityIcon className={cn('h-3 w-3 mt-0.5 shrink-0', priorityColors.text)} />
                        <div className="flex-1 space-y-0.5">
                          {suggestion.title && (
                            <p className={cn('font-semibold', priorityColors.text)}>
                              {suggestion.title}
                            </p>
                          )}
                          <p className="text-gray-700">{suggestion.message}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] capitalize shrink-0',
                            priorityColors.border,
                            priorityColors.text
                          )}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ContentScoreCard({ contentId }: ContentScoreCardProps) {
  const { data: scoreData, isLoading, isError, error, isFetching } = useContentScore(contentId);
  const generateScore = useGenerateContentScore(contentId);
  const rescoreCategory = useRescoreCategory(contentId);

  const score = scoreData?.data;
  const showLoading = isLoading || (generateScore.isPending && !score);

  if (showLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3>Content Quality</h3>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!score) {
    const errorMessage =
      isError && error instanceof Error
        ? error.message
        : 'Generate a quality score to see detailed analysis';

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3>Content Quality</h3>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="rounded-full bg-gray-100 p-3">
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-900">
                {isError ? 'Could Not Load Quality Score' : 'No Quality Score Available'}
              </p>
              <p className="text-xs text-gray-500">{errorMessage}</p>
            </div>
            <Button
              size="sm"
              onClick={() => generateScore.mutate()}
              disabled={generateScore.isPending}
              className="h-8"
            >
              {generateScore.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  {isError ? 'Retry Analysis' : 'Analyze Content'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const aiSuggestions = score.ai_suggestions || [];

  // Group suggestions by category
  const suggestionsByCategory: Record<string, AISuggestion[]> = {};
  aiSuggestions.forEach((suggestion) => {
    const category = suggestion.category.toLowerCase();
    // Normalize category names
    const normalizedCategory = category === 'keyword' ? 'keywords' : category === 'word count' ? 'word_count' : category;
    if (!suggestionsByCategory[normalizedCategory]) {
      suggestionsByCategory[normalizedCategory] = [];
    }
    suggestionsByCategory[normalizedCategory].push(suggestion);
  });

  const scoreMetrics = [
    { name: 'Readability', value: score.readability_score, icon: BookOpen, category: 'readability' },
    { name: 'SEO', value: score.seo_score, icon: Search, category: 'seo' },
    { name: 'Structure', value: score.structure_score, icon: FileText, category: 'structure' },
    { name: 'Keywords', value: score.keyword_score, icon: Hash, category: 'keywords' },
    { name: 'Links', value: score.link_score, icon: Link2, category: 'links' },
    { name: 'Images', value: score.image_score, icon: Image, category: 'images' },
    { name: 'Word Count', value: score.word_count_score, icon: Target, category: 'word_count' }
  ];


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <BarChart3 className="h-4 w-4 text-gray-500" />
          <h3>Content Quality</h3>
          {score.ai_enabled && (
            <Badge variant="outline" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Enhanced
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => generateScore.mutate()}
          disabled={generateScore.isPending || isFetching}
        >
          {generateScore.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Overall Score Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <OverallScoreCircle
              score={score.overall_score}
              level={score.score_level}
              levelDisplay={score.score_level_display}
            />
            <div className="flex-1 w-full space-y-3 sm:space-y-4">
              <ScoreBarChart
                scores={scoreMetrics}
                suggestionsByCategory={suggestionsByCategory}
                onRescoreCategory={(category) => rescoreCategory.mutate(category)}
                rescoringCategory={
                  rescoreCategory.isPending ? rescoreCategory.variables ?? null : null
                }
                categoryRescoreLimits={score.category_rescore_limits}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Quality Notes */}
      {score.ai_quality_notes && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Zap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-semibold text-gray-900">AI Quality Assessment</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{score.ai_quality_notes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}