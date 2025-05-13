/*
  # Create messages table for chat functionality

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to users)
      - `receiver_id` (uuid, foreign key to users)
      - `content` (text)
      - `edited` (boolean)
      - `read` (boolean)
      - `read_at` (timestamp)
      - Various timestamps

  2. Security
    - Enable RLS
    - Add policies for message access
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited boolean DEFAULT false,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy for users to update their own sent messages
CREATE POLICY "Users can update own sent messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sender_id AND
    (EXTRACT(EPOCH FROM (now() - created_at)) / 60) <= 5
  );

-- Policy for users to delete their own sent messages
CREATE POLICY "Users can delete own sent messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Create updated_at trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();