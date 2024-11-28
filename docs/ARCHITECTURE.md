# Application Architecture

## Overview
The ORYOKI Knowledge Base is a React-based application for managing internal knowledge and documentation.

## Tech Stack
- React 18.3.1
- TypeScript
- Vite
- Tailwind CSS
- Supabase (Backend)
- Lucide React (Icons)

## Key Features
1. Authentication System
2. Knowledge Entry Management
3. Topic Organization
4. Version History
5. Improvements Tracking
6. Export Functionality

## Component Structure

### Core Components
- `Auth.tsx`: Handles user authentication
- `KnowledgeForm.tsx`: Main form for creating/editing entries
- `SearchEntries.tsx`: Search and filter functionality
- `TopicMultiSelect.tsx`: Topic management
- `ImprovementsModal.tsx`: Improvements suggestion system

### Supporting Components
- `StarRating.tsx`: Reusable rating component
- `ExportButton.tsx`: Export functionality
- `ViewEntryModal.tsx`: Entry viewing
- `EditEntryModal.tsx`: Entry editing

## Data Flow
1. User Authentication
2. Data Fetching from Supabase
3. Local State Management
4. Real-time Updates
5. Version Control
6. Export Generation

## Database Schema

### Main Tables
- entries
- topics
- entry_topics
- entry_versions
- improvements

### Entry Types
- Support Cases
- Product Knowledge
- Process Documentation

## Security
- Row Level Security (RLS)
- Authentication Required
- Protected Routes
- Secure API Calls