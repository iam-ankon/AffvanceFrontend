'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlogSourcePanelProps {
  keywordInfo?: {
    keyword: string;
    search_volume: number;
    keyword_difficulty: number;
    competition: number;
  };
}

export function BlogSourcePanel({ keywordInfo }: BlogSourcePanelProps) {
  return (
    <ScrollArea className="flex h-full flex-col border-l border-gray-200 bg-white">
      <div className="p-6">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Keyword Info</h3>
          </div>
          {keywordInfo ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Keyword</span>
                    <div className="font-medium">{keywordInfo.keyword}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">Volume</span>
                      <div className="font-medium">{keywordInfo.search_volume}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Difficulty</span>
                      <div className="font-medium">{keywordInfo.keyword_difficulty}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Competition</span>
                      <div className="font-medium">{keywordInfo.competition}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No keyword information available</div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
