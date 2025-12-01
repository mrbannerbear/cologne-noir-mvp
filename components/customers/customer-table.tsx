'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import type { CustomerWithStats } from '@/types';

interface CustomerTableProps {
  customers: CustomerWithStats[];
  onRowClick?: (customer: CustomerWithStats) => void;
}

export function CustomerTable({ customers, onRowClick }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center border-2 border-dashed border-foreground/30">
        <p className="text-sm text-muted-foreground">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-foreground">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-foreground bg-foreground text-background">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Phone
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
              Orders
            </th>
            <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
              Total Spent
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Last Order
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              onClick={() => onRowClick?.(customer)}
              className="cursor-pointer border-b border-foreground/20 transition-colors hover:bg-muted/50"
            >
              <td className="px-4 py-3">
                <span className="font-medium">
                  {customer.full_name || 'No name'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {customer.email}
              </td>
              <td className="px-4 py-3 text-sm">
                {customer.phone || '-'}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                {customer.order_count}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm">
                {formatCurrency(customer.total_spent)}
              </td>
              <td className="px-4 py-3 text-sm">
                {customer.last_order_date
                  ? formatDate(customer.last_order_date)
                  : '-'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(customer.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
