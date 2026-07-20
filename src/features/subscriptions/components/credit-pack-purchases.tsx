'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCreditPackPurchases } from '@/features/subscriptions/hooks/use-subscriptions';
import { History } from 'lucide-react';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed: 'default',
  refunded: 'destructive',
  failed: 'outline',
};

export function CreditPackPurchasesCard() {
  const { data: purchases, isLoading } = useCreditPackPurchases();

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl" />;
  }

  if (!purchases || purchases.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Credit Pack Purchases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Pack</TableHead>
              <TableHead>Credits Granted</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.slice(0, 10).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-xs font-medium">{p.pack_name}</TableCell>
                <TableCell className="text-xs">
                  +{p.ai_credits_granted.toLocaleString()} AI ·{' '}
                  +{p.keyword_credits_granted.toLocaleString()} KW
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  ${p.price_paid} {p.currency}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] ?? 'outline'} className="text-[10px] capitalize">
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}