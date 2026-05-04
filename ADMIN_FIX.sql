-- ═══════════════════════════════════════════════════════════════
-- BST HUB — ADMIN FIX SQL
-- Supabase Dashboard → SQL Editor میں یہ پورا چلائیں
-- ═══════════════════════════════════════════════════════════════

-- 1. Notifications INSERT policy (admin کو notifications بھیجنے دیں)
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 2. Orders: admin کو سب orders دیکھنے دیں (اگر پرانی policy ہے تو replace)
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Payments: admin کو سب payments دیکھنے دیں
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. Admin profile upsert policy
DROP POLICY IF EXISTS "Admins can upsert profiles" ON public.profiles;
CREATE POLICY "Admins can upsert profiles" ON public.profiles
  FOR UPDATE USING (true);

-- 5. Admin profile کو insert کرنے دیں (اگر پہلی بار login ہو)
DROP POLICY IF EXISTS "Allow profile insert by anyone" ON public.profiles;
CREATE POLICY "Allow profile insert by anyone" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- یہ سب چلانے کے بعد Admin Panel refresh کریں
-- ═══════════════════════════════════════════════════════════════
