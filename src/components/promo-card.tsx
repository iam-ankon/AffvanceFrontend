import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PromoCard() {
  return (
    <Card className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 group-data-[collapsible=icon]:hidden">
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-opacity-30 rounded bg-black px-2 text-xs font-bold text-white backdrop-blur-sm">
            PRO
          </div>
          <div className="text-sm font-semibold text-white">Discount - 50%</div>
        </div>
        <CardTitle className="text-lg font-semibold text-white">Become Pro!</CardTitle>
        <CardDescription className="text-opacity-90 text-sm text-white">
          Unlock access to all AI-powered blog templates and writing tools
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Link href="/pricing" className="w-full">
          <Button
            size="sm"
            className="w-full border border-white/30 bg-white/95 font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white hover:shadow-xl active:scale-[0.98]"
          >
            Get Pro Now
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
