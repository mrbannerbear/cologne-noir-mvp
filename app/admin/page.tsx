'use client';

import {
  Package,
  DollarSign,
  FlaskConical,
  Users,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { KpiCard } from '@/components/admin/kpi-card';
import { OrderPipeline } from '@/components/admin/order-pipeline';
import { StockHealthTable } from '@/components/admin/stock-health-table';
import { LoadingPage } from '@/components/shared/loading-spinner';
import { useAdminStats } from '@/hooks/use-admin-stats';
import { useAdminOrders } from '@/hooks/use-orders';
import { useAdminProducts } from '@/hooks/use-products';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: products, isLoading: productsLoading } = useAdminProducts();

  const isLoading = statsLoading || ordersLoading || productsLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  const lowStockProducts =
    products?.filter((p) => p.current_volume_ml < LOW_STOCK_THRESHOLD && p.is_active) ||
    [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold uppercase tracking-wider">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Welcome to the Cologne Noir admin panel
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pending Orders"
          value={stats?.pending_orders || 0}
          icon={Package}
          inverted={stats?.pending_orders ? stats.pending_orders > 0 : false}
        />
        <KpiCard
          title="Today's Revenue"
          value={stats?.revenue_today || 0}
          icon={DollarSign}
          isCurrency
        />
        <KpiCard
          title="Active Products"
          value={stats?.total_products || 0}
          icon={FlaskConical}
        />
        <KpiCard
          title="Total Customers"
          value={stats?.total_customers || 0}
          icon={Users}
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={Package}
        />
        <KpiCard
          title="Total Revenue"
          value={stats?.total_revenue || 0}
          icon={TrendingUp}
          isCurrency
        />
        <KpiCard
          title="Low Stock Products"
          value={stats?.low_stock_products || 0}
          icon={AlertTriangle}
          inverted={stats?.low_stock_products ? stats.low_stock_products > 0 : false}
        />
        <KpiCard
          title="Orders Today"
          value={stats?.orders_today || 0}
          icon={Package}
        />
      </div>

      {/* Order Pipeline */}
      {orders && orders.length > 0 && <OrderPipeline orders={orders} />}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div>
          <h2 className="mb-4 font-serif text-xl font-bold uppercase tracking-wider">
            Low Stock Alert
          </h2>
          <StockHealthTable products={lowStockProducts} />
        </div>
      )}
    </div>
  );
}
