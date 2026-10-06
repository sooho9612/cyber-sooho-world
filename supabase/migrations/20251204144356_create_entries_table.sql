/*
  # Create diary entries table

  1. New Tables
    - `entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `title` (text) - Title of the diary entry
      - `content` (text) - Main content of the diary entry
      - `date` (text) - Formatted date string (yy.mm.dd format with Korean day)
      - `time` (text) - Time string
      - `location` (text) - Location information
      - `keywords` (text) - Comma-separated keywords
      - `image_url` (text, nullable) - Base64 encoded image string
      - `created_at` (timestamptz) - Timestamp when entry was created
  
  2. Security
    - Enable RLS on `entries` table
    - Add policies for public read access (everyone sees same content)
    - Add policies for public write access (anyone can create/update/delete)
    
  3. Notes
    - This is a shared diary where all users see the same entries
    - Images are stored as Base64 strings in the database
*/

CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  keywords text DEFAULT '',
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read entries"
  ON entries
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert entries"
  ON entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update entries"
  ON entries
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete entries"
  ON entries
  FOR DELETE
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries(created_at DESC);
