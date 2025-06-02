-- Add total_words column to reading_history table
ALTER TABLE public.reading_history 
ADD COLUMN total_words integer;

-- Create index for better performance
CREATE INDEX reading_history_total_words_idx ON public.reading_history(total_words);

-- Note: total_words will be populated by the application for new entries
-- Existing entries will have NULL total_words until they are updated by the app 