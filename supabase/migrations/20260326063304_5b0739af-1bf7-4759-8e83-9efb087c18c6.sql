-- Create storage bucket for voice messages
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-messages', 'voice-messages', true);

-- Allow authenticated users to upload voice messages
CREATE POLICY "Users can upload voice messages" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'voice-messages' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read voice messages
CREATE POLICY "Users can read voice messages" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'voice-messages');
