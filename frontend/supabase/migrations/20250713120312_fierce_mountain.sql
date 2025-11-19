/*
  # Create job leads table

  1. New Tables
    - `job_leads`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `category` (text, required)
      - `location` (text, required)
      - `budget` (text, required)
      - `urgency` (enum: Low, Medium, High)
      - `posted_by` (uuid, foreign key to users)
      - `posted_date` (date)
      - `contact_details` (jsonb)
      - `purchased_by` (uuid array)
      - `max_purchases` (integer)
      - `price` (numeric)
      - `interests` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `job_leads` table
    - Add policies for homeowners to manage their leads
    - Add policies for tradespeople to view and purchase leads
*/

-- Create custom types
CREATE TYPE urgency_level AS ENUM ('Low', 'Medium', 'High');

-- Create job_leads table
CREATE TABLE IF NOT EXISTS job_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  budget text NOT NULL,
  urgency urgency_level NOT NULL DEFAULT 'Medium',
  posted_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  posted_date date DEFAULT CURRENT_DATE,
  contact_details jsonb NOT NULL,
  purchased_by uuid[] DEFAULT '{}',
  max_purchases integer DEFAULT 6,
  price numeric(10,2) DEFAULT 9.99,
  interests jsonb[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE job_leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Homeowners can manage their own job leads"
  ON job_leads
  FOR ALL
  TO authenticated
  USING (posted_by = auth.uid());

CREATE POLICY "Tradespeople can view active job leads"
  ON job_leads
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

CREATE POLICY "Tradespeople can update job leads they purchased"
  ON job_leads
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = ANY(purchased_by) AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.type = 'tradesperson'
    )
  );

CREATE POLICY "Public can view basic job lead info"
  ON job_leads
  FOR SELECT
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_job_leads_updated_at
  BEFORE UPDATE ON job_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_leads_posted_by ON job_leads(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_leads_category ON job_leads(category);
CREATE INDEX IF NOT EXISTS idx_job_leads_location ON job_leads(location);
CREATE INDEX IF NOT EXISTS idx_job_leads_urgency ON job_leads(urgency);
CREATE INDEX IF NOT EXISTS idx_job_leads_posted_date ON job_leads(posted_date);
CREATE INDEX IF NOT EXISTS idx_job_leads_purchased_by ON job_leads USING GIN(purchased_by);