-- MarketNest E-commerce Tables
-- Cart, Wishlist, and Product Ratings

-- =============================================
-- CART_ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- =============================================
-- WISHLIST_ITEMS TABLE
-- =============================================
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- =============================================
-- PRODUCT_RATINGS TABLE
-- =============================================
CREATE TABLE public.product_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_product_ratings_product_id ON public.product_ratings(product_id);
CREATE INDEX idx_product_ratings_user_id ON public.product_ratings(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ratings ENABLE ROW LEVEL SECURITY;

-- Cart Items: Users can only manage their own cart
CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'user'
    )
  );

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Wishlist Items: Users can only manage their own wishlist
CREATE POLICY "Users can view own wishlist items"
  ON public.wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON public.wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'user'
    )
  );

CREATE POLICY "Users can delete own wishlist items"
  ON public.wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Product Ratings: Users can read all ratings, but only manage their own
CREATE POLICY "Anyone authenticated can read product ratings"
  ON public.product_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own product ratings"
  ON public.product_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'user'
    )
  );

CREATE POLICY "Users can update own product ratings"
  ON public.product_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own product ratings"
  ON public.product_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_ratings_updated_at
  BEFORE UPDATE ON public.product_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
