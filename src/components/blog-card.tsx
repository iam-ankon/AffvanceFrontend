import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Eye,
  Link,
  MoreHorizontal,
  MousePointer,
  TrendingUp,
  Users
} from 'lucide-react';
import Image from 'next/image';

export default function BlogCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="flex gap-4 p-4">
        {/* Post Image */}
        <div className="flex-shrink-0">
          <Image
            src={'/placeholder.svg'}
            alt={'title'}
            width={192}
            height={112}
            className="rounded-lg object-cover"
          />
          <div className="mt-2 flex items-center gap-2">
            <Badge className="bg-orange-500 px-2 py-1 text-xs text-white hover:bg-orange-600">
              PUBLISHED
            </Badge>
            <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-orange-500">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between">
            <h2 className="line-clamp-2 text-lg leading-tight font-semibold text-gray-900">
              Title
            </h2>
            <div className="ml-4 flex items-center gap-2">
              <Button variant="outline" size="sm" className="bg-transparent text-gray-600">
                View Details
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent text-gray-600">
                Edit Blog
              </Button>
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Shafin
            </span>
            <span>2025-08-14</span>
            <span>2025-08-14</span>
          </div>

          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="font-medium">WORDS:</span>
              <span>100</span>
            </div>
            <div className="flex items-center gap-1">
              <Link className="h-4 w-4" />
              <span className="font-medium">LINKS:</span>
              <span>10</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className="h-4 w-4" />
              <span className="font-medium">CLICKS:</span>
              <span>10</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">EARNINGS:</span>
              <span>$100</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">CTR:</span>
              <span>20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
