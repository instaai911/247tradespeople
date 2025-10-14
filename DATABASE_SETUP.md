# Supabase Database Setup Guide

This guide will help you set up the database tables for your 24/7 Tradespeople application.

## Prerequisites

1. **Supabase Account**: Make sure you have a Supabase account and project created
2. **Environment Variables**: Ensure your `.env` file has the correct Supabase credentials

## Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar

### Step 2: Run Migration Scripts

Execute the following SQL scripts **in order**:

#### 1. Create Users Table
```sql
-- Copy and paste the contents of: supabase/migrations/create_users_table.sql
```

#### 2. Create Job Leads Table
```sql
-- Copy and paste the contents of: supabase/migrations/create_job_leads_table.sql
```

#### 3. Create Quote Requests Table
```sql
-- Copy and paste the contents of: supabase/migrations/create_quote_requests_table.sql
```

#### 4. Insert Sample Data (Optional)
```sql
-- Copy and paste the contents of: supabase/migrations/insert_sample_data.sql
```

### Step 3: Verify Setup

After running the scripts, verify your setup:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - `users`
   - `job_leads` 
   - `quote_requests`

3. Check that Row Level Security (RLS) is enabled on all tables
4. Verify that sample data was inserted (if you ran the sample data script)

## Database Schema Overview

### Users Table
- Stores both homeowners and tradespeople
- Includes profile information, verification status, credits, and membership details
- Has RLS policies for data privacy

### Job Leads Table
- Stores job postings from homeowners
- Tracks purchases and interests from tradespeople
- Links to users table via foreign keys

### Quote Requests Table
- Stores quote requests from homeowners
- Tracks responses from tradespeople
- Includes project details and contact information

## Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Authentication Required**: Most operations require user authentication
- **Data Privacy**: Users can only access their own data
- **Public Access**: Limited public read access for discovery features

## Next Steps

1. **Test the Connection**: Your app should now connect to Supabase successfully
2. **Authentication Setup**: Configure Supabase Auth for user registration/login
3. **Real-time Features**: Enable real-time subscriptions for live updates
4. **File Storage**: Set up Supabase Storage for user avatars and project images

## Troubleshooting

- **Permission Errors**: Make sure RLS policies are correctly applied
- **Connection Issues**: Verify your environment variables are correct
- **Data Not Showing**: Check that sample data was inserted properly

For more help, refer to the [Supabase Documentation](https://supabase.com/docs).