/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique, required)
      - `type` (enum: homeowner, tradesperson)
      - `avatar` (text, optional)
      - `location` (text, optional)
      - `trades` (text array, for tradespeople)
      - `rating` (numeric, for tradespeople)
      - `reviews` (integer, for tradespeople)
      - `verified` (boolean, for tradespeople)
      - `credits` (numeric, for tradespeople)
      - `membership_type` (enum)
      - `membership_expiry` (timestamp)
      - `verification_status` (enum)
      - `verification_data` (jsonb)
      - `account_status` (enum)
      - `parked_date` (timestamp)
      - `reactivated_date` (timestamp)
      - `working_area` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to manage their own data
    - Add policy for public read access to tradesperson profiles
*/

-- Create custom types
CREATE TYPE user_type AS ENUM ('homeowner', 'tradesperson');
CREATE TYPE account_status AS ENUM ('active', 'parked', 'deleted');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE membership_type AS ENUM ('none', 'basic', 'premium', 'lifetime');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  type user_type NOT NULL,
  avatar text,
  location text,
  trades text[],
  rating numeric(3,2) DEFAULT 0,
  reviews integer DEFAULT 0,
  verified boolean DEFAULT false,
  credits numeric(10,2) DEFAULT 0,
  membership_type membership_type DEFAULT 'none',
  membership_expiry timestamptz,
  verification_status verification_status DEFAULT 'pending',
  verification_data jsonb,
  account_status account_status DEFAULT 'active',
  parked_date timestamptz,
  reactivated_date timestamptz,
  working_area jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can read tradesperson profiles"
  ON users
  FOR SELECT
  TO public
  USING (type = 'tradesperson' AND account_status = 'active');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);