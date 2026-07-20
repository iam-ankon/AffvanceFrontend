'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { useCreditBalance } from '@/features/subscriptions/hooks/use-subscriptions';
import { Sparkles } from 'lucide-react';
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

const chartConfig = {
  credits: {
    label: 'Available Credits',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function AvailableCredits() {
  const { data: credits } = useCreditBalance();

  const aiCredits = credits?.ai_credits ?? 0;
  const kwCredits = credits?.keyword_credits ?? 0;
  const total = aiCredits + kwCredits;

  const chartData = [{ name: 'credits', value: total, fill: 'var(--color-credits)' }];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Available Credits</CardTitle>
        <CardDescription>
          {credits?.plan_name ? `${credits.plan_name} · ${credits.days_remaining}d remaining` : 'Current period'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadialBarChart data={chartData} endAngle={total > 0 ? 270 : 10} innerRadius={80} outerRadius={140}>
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="value" background />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Credits
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {aiCredits.toLocaleString()} AI · {kwCredits.toLocaleString()} Keyword
        </div>
        <div className="text-muted-foreground leading-none">
          {credits?.has_subscription
            ? 'Credits available for this billing period'
            : 'Subscribe to a plan to get credits'}
        </div>
      </CardFooter>
    </Card>
  );
}
