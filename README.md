# LeetCode Multi Tracker (LCMT)

A Progressive Web App (PWA) for tracking multiple LeetCode users' progress and statistics in real-time.

## Overview

LeetCode Multi Tracker allows you to monitor any LeetCode user's progress, including their solved problems, difficulty breakdown, rankings, and acceptance rates. The app stores historical data to track progress over time and can be installed on your mobile device for quick access.

## Features

- **Multi-User Tracking**: Track any LeetCode username without authentication
- **Real-Time Stats**: Fetch latest statistics directly from LeetCode's GraphQL API
- **Progress Visualization**: View problem-solving progress by difficulty (Easy, Medium, Hard)
- **Historical Data**: Store and display progress over time using Supabase
- **Recent Users**: Quick access to previously tracked users stored locally
- **PWA Support**: Install on mobile devices as a native-like app
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## How It Works

### Data Flow

1. **User Input**: Enter any LeetCode username on the homepage
2. **Data Fetching**: The app queries LeetCode's GraphQL API to fetch:
   - Total problems solved (Easy, Medium, Hard)
   - Acceptance rate and submission statistics
   - User ranking and reputation
   - Total available problems by difficulty
3. **Data Storage**: Statistics are synced to Supabase database with timestamps
4. **Visualization**: Data is displayed with progress bars, stats cards, and trend indicators
5. **Local Caching**: Recent users are stored in localStorage for quick access

### API Endpoints

- `GET /api/sync?username={username}` - Fetch and sync user stats from LeetCode

### Database Schema

The app uses Supabase with the following structure:
- **users**: Stores user statistics with timestamps
- Tracks: solved problems, acceptance rates, rankings, and difficulty breakdowns
- Indexed by username for efficient querying

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **API**: LeetCode GraphQL API
- **PWA**: Service Worker with offline caching
- **Font**: JetBrains Mono for monospace code aesthetics

## Installation

### Prerequisites

- Node.js 18+ or Bun
- Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd leetcode-multi-tracker
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set up the database:
Run the SQL schema in your Supabase project:
```bash
# Execute the contents of supabase-schema.sql in your Supabase SQL Editor
```

5. Start the development server:
```bash
npm run dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## PWA Installation

### Generating Icons

1. Open `http://localhost:3000/icon-generator.html` in your browser
2. Click "Download All Icons" to generate all required icon sizes
3. Save all downloaded icons to the `public/` directory

### Installing on Mobile

**iOS (Safari):**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear as "LCMT" on your home screen

**Android (Chrome):**
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home Screen"
4. The app will appear as "LCMT" in your app drawer

## Usage

### Tracking a User

1. Enter a LeetCode username in the input field
2. Click "Track User" or press Enter
3. View the user's statistics and progress
4. Click "Sync Latest Stats" to update with fresh data from LeetCode

### Managing Recent Users

- Recently tracked users appear on the homepage
- Click a user card to quickly view their stats
- Click the X button to remove a user from recent list

### Theme Switching

- Click the theme toggle button (sun/moon icon) to switch between light and dark modes
- Preference is saved locally and persists across sessions

## Project Structure

```
leetcode-multi-tracker/
├── public/               # Static assets and PWA files
│   ├── manifest.json     # PWA manifest
│   ├── sw.js            # Service worker
│   └── icon-*.png       # App icons (various sizes)
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── api/sync/    # API route for LeetCode data sync
│   │   ├── user/[username]/ # Dynamic user profile pages
│   │   ├── layout.js    # Root layout with PWA meta tags
│   │   └── page.jsx     # Homepage
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── user-stats.jsx       # User statistics display
│   │   ├── username-input.jsx   # Username input form
│   │   ├── recent-users.jsx     # Recent users list
│   │   └── theme-toggle.jsx     # Dark/light mode toggle
│   └── lib/            # Utility functions
│       ├── supabase.js  # Supabase client configuration
│       └── utils.js     # Helper utilities
└── supabase-schema.sql  # Database schema

```

## Development

- Built with Next.js App Router and React Server Components
- Uses Tailwind CSS for styling with custom theme configuration
- Implements progressive enhancement for offline functionality
- Follows modern React patterns with hooks and client components where needed

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app will automatically be deployed with PWA support enabled.

### Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- Static file serving for PWA assets
- Environment variable configuration

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
