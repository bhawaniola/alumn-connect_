# Alumni Availability Feature

## Overview
Added a comprehensive availability feature that allows alumni to mark themselves as available/unavailable for mentorship, and enables students to filter mentors based on their availability status.

## Backend Changes

### 1. Database Schema (`app.py`)
- **Added Column**: `is_available` (BOOLEAN, DEFAULT 1) to the `users` table
- Location: Lines 175-178 in `app.py`

### 2. API Endpoints Updated

#### GET `/api/alumni`
- **Added**: `is_available` field to response
- **Added**: Query parameter support for filtering by availability
  - `?availability=all` - Show all alumni (default)
  - `?availability=available` - Show only available alumni
  - `?availability=unavailable` - Show only unavailable alumni
- Location: Lines 1968-2023 in `app.py`

#### GET `/api/profile`
- **Added**: `is_available` field to user profile response
- Location: Lines 1384-1453 in `app.py`

#### PUT `/api/profile`
- **Added**: Support for updating `is_available` status
- Alumni can now toggle their availability through profile updates
- Location: Lines 1527-1612 in `app.py`

### 3. Seed Data (`seed_data.py`)
- **Updated**: All alumni in seed data are set to available by default (`is_available = 1`)
- Location: Lines 367-384 in `seed_data.py`

### 4. Migration Script
- **Created**: `add_availability_column.py`
- Adds the `is_available` column to existing databases
- Sets all existing alumni to available by default
- Run with: `python add_availability_column.py`

## Frontend Changes

### 1. FindMentorsPage (`FindMentorsPage.tsx`)

#### Interface Updates
- **Added**: `is_available?: boolean` to `Alumni` interface

#### State Management
- **Added**: `availabilityFilter` state for filtering alumni by availability

#### Filter Logic
- **Added**: Availability filter that filters alumni based on their `is_available` status
- Integrated with existing filter system

#### UI Components
- **Added**: Availability filter dropdown with options:
  - "All Alumni"
  - "Available for Mentorship"
  - "Not Available"
- **Added**: Availability badge on each alumni card
  - Green badge with checkmark for available alumni
  - Gray badge for unavailable alumni

### 2. Profile Edit (To be implemented by alumni)
Alumni can edit their availability status through their profile settings. The backend already supports this via the PUT `/api/profile` endpoint.

## Usage

### For Students
1. Navigate to "Find Mentors" page
2. Use the "Availability" filter dropdown to:
   - View all alumni
   - View only available mentors
   - View unavailable alumni
3. See availability status on each alumni card (green = available, gray = not available)

### For Alumni
1. Navigate to profile settings
2. Toggle the "Available for Mentorship" option
3. Save profile changes
4. Students will now see your updated availability status

## Database Migration

To add this feature to an existing database:

```bash
cd backend
python add_availability_column.py
```

This will:
- Add the `is_available` column to the users table
- Set all existing alumni to available by default

## API Examples

### Get Available Alumni Only
```bash
GET /api/alumni?availability=available
Authorization: Bearer <token>
```

### Update Alumni Availability
```bash
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_available": true  // or false
}
```

## Benefits

1. **For Students**: Easily find mentors who are currently available for mentorship
2. **For Alumni**: Control when they want to be approached for mentorship
3. **Better Experience**: Reduces unsuccessful mentorship requests to busy alumni
4. **Transparency**: Clear visibility of mentor availability status

## Future Enhancements

- Add availability schedule (e.g., available on weekends only)
- Add automatic availability toggle based on calendar integration
- Add notification system when alumni become available
- Add "busy until" date feature
