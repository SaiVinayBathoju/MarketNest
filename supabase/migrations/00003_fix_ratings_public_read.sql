-- Fix: Allow public reading of product ratings (anyone can view ratings)
-- Only authenticated users can submit ratings

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone authenticated can read product ratings" ON public.product_ratings;

-- Create new policy that allows public read access
CREATE POLICY "Anyone can read product ratings"
  ON public.product_ratings FOR SELECT
  TO public
  USING (true);
