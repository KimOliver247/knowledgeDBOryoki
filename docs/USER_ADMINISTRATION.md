# User Administration

## Overview
The knowledge base system includes a comprehensive user administration system that allows administrators to manage users and their access levels.

## Features

### User Roles
- **Admin**: Full access to all features including user management
- **User**: Access to knowledge base features only

### User Management
- Create new users
- Set user roles (admin/user)
- Activate/deactivate users
- Track user creation and last login times

### Security
- Passwords are securely hashed using bcrypt
- Row Level Security (RLS) policies enforce access control
- Session-based authentication

## Database Schema

### Users Table (kb_users)
```sql
CREATE TABLE kb_users (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  password_hash TEXT,
  role user_role,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  created_by UUID,
  last_login TIMESTAMPTZ
);
```

### Security Functions
- `hash_password(password TEXT)`: Securely hashes passwords
- `verify_password(stored_hash TEXT, attempted_password TEXT)`: Verifies passwords
- `authenticate_user(p_username TEXT, p_password TEXT)`: Handles user authentication

### RLS Policies
- Users can only view their own data (except admins)
- Only admins can create, update, and delete users
- Authentication required for all operations

## Usage

### Admin Interface
1. Log in as an admin user
2. Click "User Administration" button
3. Manage users through the interface:
   - Create new users
   - Set roles
   - Activate/deactivate accounts
   - View user activity

### Default Admin Account
- Username: admin
- Password: admin
- **Important**: Change the default password after first login

## Security Considerations
- Passwords are never stored in plain text
- All database operations are protected by RLS
- Session tokens are required for authenticated operations
- User actions are logged for audit purposes