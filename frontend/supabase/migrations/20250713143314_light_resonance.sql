/*
  # Update membership types to replace lifetime with 5-year unlimited

  1. Changes
    - Update membership_type enum to replace 'lifetime' with 'unlimited_5_year'
    - Update any existing lifetime memberships to unlimited_5_year with proper expiry dates
    - Add proper expiry dates for existing memberships

  2. Security
    - Maintains existing RLS policies
    - No changes to access controls
*/

-- Update the membership_type enum
ALTER TYPE membership_type RENAME VALUE 'lifetime' TO 'unlimited_5_year';

-- Update any existing lifetime memberships to have a 5-year expiry from now
UPDATE users 
SET 
  membership_expiry = (NOW() + INTERVAL '5 years')::timestamptz
WHERE 
  membership_type = 'unlimited_5_year' 
  AND membership_expiry IS NULL;

-- Set expiry dates for existing basic and premium memberships (1 year from now if not set)
UPDATE users 
SET 
  membership_expiry = (NOW() + INTERVAL '1 year')::timestamptz
WHERE 
  membership_type IN ('basic', 'premium') 
  AND membership_expiry IS NULL;