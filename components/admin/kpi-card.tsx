import { cn, formatCurrency } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  isCurrency?: boolean;
  inverted?: boolean;
  trend?: {
    value: number;
    label: string;
  };
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  isCurrency = false,
  inverted = false,
  trend,
}: KpiCardProps) {
  const displayValue = isCurrency ? formatCurrency(Number(value)) : value;

  return (
    <div
      className={cn(
        'border-2 p-6',
        inverted
          ? 'border-foreground bg-foreground text-background'
          : 'border-foreground bg-background'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-wider',
              inverted ? 'text-background/70' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">{displayValue}</p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs',
                inverted ? 'text-background/70' : 'text-muted-foreground'
              )}
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            'border-2 p-3',
            inverted ? 'border-background' : 'border-foreground'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
