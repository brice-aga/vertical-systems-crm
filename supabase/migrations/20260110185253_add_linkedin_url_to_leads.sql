/*
  # Add LinkedIn URL field to leads table

  1. Changes
    - Add `linkedin_url` column to `leads` table
      - VARCHAR(255) to store LinkedIn profile URLs
      - Optional field (can be NULL)

  2. Notes
    - This field enables storing LinkedIn profile information for lead tracking
    - No index needed as this field won't be frequently queried
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'linkedin_url'
  ) THEN
    ALTER TABLE leads ADD COLUMN linkedin_url VARCHAR(255);
  END IF;
END $$;
