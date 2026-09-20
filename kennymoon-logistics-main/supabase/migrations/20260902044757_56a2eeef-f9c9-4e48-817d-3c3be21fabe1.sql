CREATE POLICY "own receipts read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())
  ));
CREATE POLICY "own receipts insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND (
    (storage.foldername(name))[1] = auth.uid()::text OR public.can_warehouse(auth.uid())
  ));
CREATE POLICY "own receipts update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'receipts' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.can_warehouse(auth.uid())));