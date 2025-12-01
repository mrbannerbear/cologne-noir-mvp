'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CustomerTable } from '@/components/customers/customer-table';
import { CustomerModal } from '@/components/customers/customer-modal';
import { CreateCustomerModal } from '@/components/admin/create-customer-modal';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useCustomersWithStats } from '@/hooks/use-customers';
import { formatCurrency } from '@/lib/utils';
import type { CustomerWithStats } from '@/types';

export default function AdminCustomersPage() {
  const { data: customers, isLoading, refetch } = useCustomersWithStats();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(
    null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingPage />;
  }

  const totalRevenue =
    customers?.reduce((sum, c) => sum + c.total_spent, 0) || 0;
  const totalOrders =
    customers?.reduce((sum, c) => sum + c.order_count, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
            Customers
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your customer base
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-transparent hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Customers
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">
            {customers?.length || 0}
          </p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Orders
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">{totalOrders}</p>
        </div>
        <div className="border-2 border-foreground bg-foreground p-4 text-background">
          <p className="text-xs font-bold uppercase tracking-wider text-background/70">
            Total Revenue
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Table */}
      <CustomerTable
        customers={customers || []}
        onRowClick={setSelectedCustomer}
      />

      {/* Customer Modal */}
      <CustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
