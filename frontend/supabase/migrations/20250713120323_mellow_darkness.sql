/*
  # Create quote requests table

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `homeowner_id` (uuid, foreign key to users)
      - `homeowner_name` (text)
      - `project_title` (text, required)
      - `project_description` (text, required)
      - `category` (text, required)
      - `location` (text, required)
      - `budget` (text, required)
      - `urgency` (enum: Low, Medium, High)
      - `contact_details` (jsonb)
      - `responses` (jsonb array)
      - `max_responses` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `quote_requests` table
    - Add policies for homeowners to manage their requests
    - Add policies for tradespeople to view and respond to requests
*/

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homeowner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  homeowner_name text NOT NULL,
  project_title text NOT NULL,
  project_description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  budget text NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'Medium',
  contact_details jsonb NOT NULL,
  responses jsonb[] DEFAULT '{}',
  max_responses integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Homeowners can manage their own quote requests"
  ON quote_requests
  FOR ALL
  TO authenticated
  USING (homeowner_id = auth.uid());

CREATE POLICY "Tradespeople can view quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'tradesperson'
      AND users.account_status = 'active'
    )
  );

CREATE POLICY "Tradespeople can update quote requests with responses"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'tradesperson'
      AND users.account_status = 'active'
    )
  );

CREATE POLICY "Public can view basic quote request info"
  ON quote_requests
  FOR SELECT
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_homeowner_id ON quote_requests(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_category ON quote_requests(category);
CREATE INDEX IF NOT EXISTS idx_quote_requests_location ON quote_requests(location);
CREATE INDEX IF NOT EXISTS idx_quote_requests_urgency ON quote_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);