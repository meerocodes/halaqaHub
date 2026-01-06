# Admin Setup Guide

## Default Admin Credentials

An admin account has already been created for you:

**Username:** ostazprof
**Password:** lalzclass

### How to Login

1. Go to your Halaqa Hub website
2. Click "Admin Login" in the top right corner
3. Enter the username and password above
4. The Admin Panel will now be visible at the bottom of the page

## Creating Additional Admin Users

To create more admin accounts, follow these steps:

### Create a New Admin Account

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Run the following SQL command:

```sql
-- Replace 'your-username' and 'your-password' with desired credentials
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your-username',
  crypt('your-password', gen_salt('bf')),
  NOW(),
  NOW(),
  '{"role": "admin"}'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'your-username'
);
```

### Update an Existing User to Admin

```sql
-- Replace 'username' with the user's username
UPDATE auth.users
SET raw_app_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'username';
```

## Admin Features

Once logged in as admin, you can:

- **Manage Classes**: Add, edit, and delete halaqa classes with schedules
  - Toggle Q&A on/off for each class (Q&A is only visible on the day of the class)
- **Manage Slides**: Upload links to class materials and presentations
- **Control Q&A**: Toggle Q&A open/closed for today's classes and mark questions as answered
- **View Attendance**: See who has marked attendance for each class

## How Q&A Works

- Q&A sessions are automatically available only on the day of scheduled classes
- Admins can enable/disable Q&A for each class when creating/editing
- On class days, admins can toggle Q&A open/closed in real-time
- Questions are anonymous and linked directly to classes
- Admins can mark questions as answered

## Security Notes

- Keep your admin credentials secure
- Only grant admin access to trusted individuals
- Regularly review admin users in your Supabase dashboard
- Consider enabling email confirmation in Supabase Auth settings for additional security
