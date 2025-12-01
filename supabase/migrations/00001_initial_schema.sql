-- Cologne Noir MVP - Initial Database Schema
-- PostgreSQL via Supabase

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE concentration_type AS ENUM ('EDT', 'EDP', 'Extrait', 'Parfum', 'Cologne');
CREATE TYPE gender_type AS ENUM ('masculine', 'feminine', 'unisex');
CREATE TYPE season_type AS ENUM ('spring', 'summer', 'fall', 'winter', 'all');
CREATE TYPE order_status AS ENUM ('pending_payment', 'new', 'decanting', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('cod', 'bkash');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE adjustment_reason AS ENUM ('spillage', 'evaporation', 'quality_check', 'damaged', 'correction', 'order_fulfillment', 'other');

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends Supabase Auth)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    phone TEXT,
    shipping_address JSONB DEFAULT '{}',
    favorite_brands TEXT[] DEFAULT '{}',
    favorite_scents TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Products table (Master Bottles)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    description TEXT,
    concentration concentration_type NOT NULL,
    gender gender_type NOT NULL,
    season season_type DEFAULT 'all' NOT NULL,
    total_volume_ml DECIMAL(10,2) NOT NULL,
    current_volume_ml DECIMAL(10,2) NOT NULL,
    batch_code TEXT,
    top_notes TEXT[] DEFAULT '{}',
    heart_notes TEXT[] DEFAULT '{}',
    base_notes TEXT[] DEFAULT '{}',
    price_10ml DECIMAL(10,2),
    price_15ml DECIMAL(10,2),
    price_30ml DECIMAL(10,2),
    price_100ml DECIMAL(10,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_volume CHECK (current_volume_ml >= 0 AND total_volume_ml >= 0)
);

-- Supplies table
CREATE TABLE supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    size_value DECIMAL(10,2),
    stock_count INTEGER DEFAULT 0 NOT NULL,
    low_stock_threshold INTEGER DEFAULT 10 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_stock CHECK (stock_count >= 0)
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    status order_status DEFAULT 'pending_payment' NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending' NOT NULL,
    bkash_transaction_id TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0 NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Order Items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    size_value DECIMAL(10,2) NOT NULL,
    product_name TEXT NOT NULL,
    product_brand TEXT NOT NULL,
    batch_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- Volume Adjustments table (Audit Trail)
CREATE TABLE volume_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    adjusted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    previous_volume DECIMAL(10,2) NOT NULL,
    new_volume DECIMAL(10,2) NOT NULL,
    adjustment_amount DECIMAL(10,2) NOT NULL,
    reason adjustment_reason NOT NULL,
    notes TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_concentration ON products(concentration);
CREATE INDEX idx_products_gender ON products(gender);
CREATE INDEX idx_products_season ON products(season);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_volume_adjustments_product_id ON volume_adjustments(product_id);
CREATE INDEX idx_volume_adjustments_order_id ON volume_adjustments(order_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER supplies_updated_at
    BEFORE UPDATE ON supplies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE volume_adjustments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (is_admin());

CREATE POLICY "Enable insert for authenticated users only"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Products policies
CREATE POLICY "Active products are publicly readable"
    ON products FOR SELECT
    USING (is_active = true OR is_admin());

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (is_admin());

-- Supplies policies
CREATE POLICY "Admins can view supplies"
    ON supplies FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage supplies"
    ON supplies FOR ALL
    USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage orders"
    ON orders FOR ALL
    USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage order items"
    ON order_items FOR ALL
    USING (is_admin());

-- Volume adjustments policies
CREATE POLICY "Admins can view volume adjustments"
    ON volume_adjustments FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can create volume adjustments"
    ON volume_adjustments FOR INSERT
    WITH CHECK (is_admin());

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Process Decant Order (Atomic Transaction)
CREATE OR REPLACE FUNCTION process_decant_order(
    p_order_id UUID,
    p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_product RECORD;
    v_supply RECORD;
    v_total_needed DECIMAL;
    v_vial_size DECIMAL;
BEGIN
    -- Get order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF v_order IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;
    
    IF v_order.status != 'pending_payment' AND v_order.status != 'new' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order cannot be processed in current status');
    END IF;
    
    -- Process each order item
    FOR v_item IN SELECT * FROM order_items WHERE order_id = p_order_id LOOP
        v_total_needed := v_item.size_value * v_item.quantity;
        v_vial_size := v_item.size_value;
        
        -- Check product volume
        SELECT * INTO v_product FROM products WHERE id = v_item.product_id FOR UPDATE;
        
        IF v_product.current_volume_ml < v_total_needed THEN
            RAISE EXCEPTION 'Insufficient volume for product %: needed % ml, available % ml',
                v_product.name, v_total_needed, v_product.current_volume_ml;
        END IF;
        
        -- Check vial supply
        SELECT * INTO v_supply FROM supplies 
        WHERE item_name = 'vial' AND size_value = v_vial_size FOR UPDATE;
        
        IF v_supply IS NULL OR v_supply.stock_count < v_item.quantity THEN
            RAISE EXCEPTION 'Insufficient % ml vials: needed %, available %',
                v_vial_size, v_item.quantity, COALESCE(v_supply.stock_count, 0);
        END IF;
        
        -- Decrement product volume
        UPDATE products 
        SET current_volume_ml = current_volume_ml - v_total_needed
        WHERE id = v_item.product_id;
        
        -- Record volume adjustment
        INSERT INTO volume_adjustments (
            product_id, adjusted_by, previous_volume, new_volume,
            adjustment_amount, reason, order_id, notes
        ) VALUES (
            v_item.product_id, p_admin_id, v_product.current_volume_ml,
            v_product.current_volume_ml - v_total_needed, -v_total_needed,
            'order_fulfillment', p_order_id,
            format('Order %s: %s x %s ml', p_order_id, v_item.quantity, v_vial_size)
        );
        
        -- Decrement vial supply
        UPDATE supplies 
        SET stock_count = stock_count - v_item.quantity
        WHERE id = v_supply.id;
        
        -- Check and decrement label supply
        SELECT * INTO v_supply FROM supplies 
        WHERE item_name = 'label' FOR UPDATE;
        
        IF v_supply IS NOT NULL AND v_supply.stock_count >= v_item.quantity THEN
            UPDATE supplies 
            SET stock_count = stock_count - v_item.quantity
            WHERE id = v_supply.id;
        END IF;
    END LOOP;
    
    -- Update order status
    UPDATE orders SET status = 'decanting' WHERE id = p_order_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Order processed successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Admin Stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_orders', (SELECT COUNT(*) FROM orders),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE status IN ('pending_payment', 'new')),
        'total_revenue', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'paid'),
        'total_products', (SELECT COUNT(*) FROM products WHERE is_active = true),
        'low_stock_products', (SELECT COUNT(*) FROM products WHERE current_volume_ml < 10 AND is_active = true),
        'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'customer'),
        'orders_today', (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE),
        'revenue_today', (SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= CURRENT_DATE AND payment_status = 'paid')
    ) INTO v_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Low Stock Products
CREATE OR REPLACE FUNCTION get_low_stock_products(p_threshold DECIMAL DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name TEXT,
    brand TEXT,
    current_volume_ml DECIMAL,
    total_volume_ml DECIMAL,
    threshold DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.brand,
        p.current_volume_ml,
        p.total_volume_ml,
        p_threshold as threshold
    FROM products p
    WHERE p.current_volume_ml < p_threshold AND p.is_active = true
    ORDER BY p.current_volume_ml ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adjust Product Volume (Manual)
CREATE OR REPLACE FUNCTION adjust_product_volume(
    p_product_id UUID,
    p_admin_id UUID,
    p_new_volume DECIMAL,
    p_reason adjustment_reason,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_product RECORD;
    v_adjustment DECIMAL;
BEGIN
    SELECT * INTO v_product FROM products WHERE id = p_product_id FOR UPDATE;
    
    IF v_product IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Product not found');
    END IF;
    
    v_adjustment := p_new_volume - v_product.current_volume_ml;
    
    -- Update product volume
    UPDATE products SET current_volume_ml = p_new_volume WHERE id = p_product_id;
    
    -- Record adjustment
    INSERT INTO volume_adjustments (
        product_id, adjusted_by, previous_volume, new_volume,
        adjustment_amount, reason, notes
    ) VALUES (
        p_product_id, p_admin_id, v_product.current_volume_ml,
        p_new_volume, v_adjustment, p_reason, p_notes
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'previous_volume', v_product.current_volume_ml,
        'new_volume', p_new_volume,
        'adjustment', v_adjustment
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
