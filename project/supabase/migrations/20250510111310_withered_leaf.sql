/*
  # Create users table with enhanced profile support

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique, 4-30 chars)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `display_name` (text, 2-30 chars)
      - `avatar_url` (text)
      - `avatar_metadata` (jsonb)
      - `last_seen` (timestamp)
      - `is_online` (boolean)
      - `email_verified` (boolean)
      - `verification_token` (text)
      - `verification_expires` (timestamp)
      - `reset_token` (text)
      - `reset_expires` (timestamp)
      - `preferences` (jsonb)
      - Various timestamps

  2. Security
    - Enable RLS
    - Add policies for user data access
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL CHECK (length(username) BETWEEN 4 AND 30 AND username ~ '^[a-zA-Z0-9_]+$'),
  email text UNIQUE NOT NULL CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password text NOT NULL,
  display_name text CHECK (length(display_name) BETWEEN 2 AND 30 AND display_name ~ '^[a-zA-Z0-9\s-]+$'),
  avatar_url text,
  avatar_metadata jsonb DEFAULT '{}',
  last_seen timestamptz DEFAULT now(),
  is_online boolean DEFAULT false,
  email_verified boolean DEFAULT false,
  verification_token text,
  verification_expires timestamptz,
  reset_token text,
  reset_expires timestamptz,
  preferences jsonb DEFAULT '{"language": "en", "theme": "light", "notifications": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();