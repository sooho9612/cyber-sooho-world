/*
  # Make user_id nullable in home tables

  1. Changes
    - Make `user_id` nullable in `home_posts` table
    - Make `user_id` nullable in `home_comments` table
  
  2. Reason
    - The HOME tab uses password-based admin editing, not full authentication
    - Users can view and comment without being logged in
    - This allows the tables to work without requiring authenticated users
*/

-- Make user_id nullable in home_posts
ALTER TABLE home_posts ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in home_comments
ALTER TABLE home_comments ALTER COLUMN user_id DROP NOT NULL;
