'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { GSAPModal } from '@/components/shared/gsap-modal';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Supply } from '@/types';

export default function AdminSuppliesPage() {
  const supabase = createClient();
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);

  // Form state
  const [itemName, setItemName] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSupplies = async () => {
      const { data } = await supabase
        .from('supplies')
        .select('*')
        .order('item_name', { ascending: true });

      setSupplies(data || []);
      setIsLoading(false);
    };
    
    fetchSupplies();
  }, [supabase]);

  const refetchSupplies = async () => {
    const { data } = await supabase
      .from('supplies')
      .select('*')
      .order('item_name', { ascending: true });

    setSupplies(data || []);
  };

  const resetForm = () => {
    setItemName('');
    setSizeValue('');
    setStockCount('');
    setLowStockThreshold('10');
    setEditingSupply(null);
  };

  const handleEdit = (supply: Supply) => {
    setEditingSupply(supply);
    setItemName(supply.item_name);
    setSizeValue(supply.size_value?.toString() || '');
    setStockCount(supply.stock_count.toString());
    setLowStockThreshold(supply.low_stock_threshold.toString());
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supplyData = {
      item_name: itemName,
      size_value: sizeValue ? parseFloat(sizeValue) : null,
      stock_count: parseInt(stockCount),
      low_stock_threshold: parseInt(lowStockThreshold),
    };

    if (editingSupply) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('supplies') as any).update(supplyData).eq('id', editingSupply.id);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('supplies') as any).insert(supplyData);
    }

    await refetchSupplies();
    setShowAddModal(false);
    resetForm();
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supply item?')) {
      await supabase.from('supplies').delete().eq('id', id);
      await refetchSupplies();
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  const lowStockSupplies = supplies.filter(
    (s) => s.stock_count <= s.low_stock_threshold
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
            Supplies
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage vials, labels, and other supplies
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-sm font-medium uppercase tracking-wider text-background"
        >
          <Plus className="h-4 w-4" />
          Add Supply
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Items
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">{supplies.length}</p>
        </div>
        <div className="border-2 border-foreground p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Stock
          </p>
          <p className="mt-2 font-serif text-3xl font-bold">
            {supplies.reduce((sum, s) => sum + s.stock_count, 0)}
          </p>
        </div>
        <div
          className={cn(
            'border-2 border-foreground p-4',
            lowStockSupplies.length > 0 && 'bg-destructive/10'
          )}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Low Stock Alerts
          </p>
          <p
            className={cn(
              'mt-2 font-serif text-3xl font-bold',
              lowStockSupplies.length > 0 && 'text-destructive'
            )}
          >
            {lowStockSupplies.length}
          </p>
        </div>
      </div>

      {/* Table */}
      {supplies.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center border-2 border-dashed border-foreground/30">
          <p className="text-muted-foreground">No supplies added yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-foreground">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-foreground bg-foreground text-background">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                  Threshold
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply) => {
                const isLowStock = supply.stock_count <= supply.low_stock_threshold;

                return (
                  <tr
                    key={supply.id}
                    className={cn(
                      'border-b border-foreground/20',
                      isLowStock && 'bg-destructive/10'
                    )}
                  >
                    <td className="px-4 py-3 font-medium capitalize">
                      {supply.item_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {supply.size_value ? `${supply.size_value}ml` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={cn(isLowStock && 'font-bold text-destructive')}>
                        {supply.stock_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {supply.low_stock_threshold}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isLowStock ? (
                        <span className="bg-destructive px-2 py-1 text-xs font-bold uppercase text-white">
                          Low
                        </span>
                      ) : (
                        <span className="border border-foreground px-2 py-1 text-xs font-bold uppercase">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(supply)}
                          className="text-sm underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(supply.id)}
                          className="text-sm text-destructive underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <GSAPModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title={editingSupply ? 'Edit Supply' : 'Add Supply'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider">
              Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
              placeholder="e.g., vial, label, cap"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider">
              Size (ml)
            </label>
            <input
              type="number"
              value={sizeValue}
              onChange={(e) => setSizeValue(e.target.value)}
              step="0.01"
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
              placeholder="Leave empty for non-sized items"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider">
              Stock Count *
            </label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              required
              min="0"
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider">
              Low Stock Threshold *
            </label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              required
              min="0"
              className="mt-1 w-full border-2 border-foreground bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full border-2 border-foreground bg-foreground py-2 text-sm font-medium uppercase tracking-wider text-background disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : editingSupply ? 'Update' : 'Add Supply'}
          </button>
        </form>
      </GSAPModal>
    </div>
  );
}
