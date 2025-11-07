# SurakshaBot Frontend

Professional Next.js dashboard for the 1930 Cyber Helpline, Odisha.

## Features

- 📊 **Real-time Dashboard** - Live statistics and metrics
- 📋 **Complaint Management** - View and manage all cyber crime complaints
- 👥 **User Management** - Track registered users
- 📈 **Analytics & Reports** - Visual insights and fraud type distribution
- 🔄 **Live Updates** - Real-time data synchronization with backend
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Professional UI** - Government-grade formal interface

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ installed
- Backend server running on port 3000
- MongoDB database connected

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:3001`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   ├── globals.css        # Global styles
│   ├── complaints/        # Complaints page
│   ├── analytics/         # Analytics & Reports page (merged)
│   ├── users/             # Users page
│   └── settings/          # Settings page
├── components/            # Reusable React components
│   ├── Header.tsx
│   ├── Navbar.tsx
│   ├── StatsCard.tsx
│   ├── RecentComplaints.tsx
│   ├── FraudTypeChart.tsx
│   └── RecentActivity.tsx
├── lib/                   # Utility functions
│   └── api.ts            # API client and functions
└── public/               # Static assets

```

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api`:

### Endpoints Used

- `GET /whatsapp/cases/all` - Fetch all complaints
- `GET /whatsapp/cases/:id` - Fetch single complaint
- `PATCH /whatsapp/cases/:id` - Update complaint status
- `GET /whatsapp/users/all` - Fetch all users
- `GET /whatsapp/users/:id` - Fetch single user
- `GET /health` - API health check

## Features by Page

### Dashboard (`/`)
- Total complaints, solved, pending statistics
- Fraud type distribution chart
- Recent activity feed
- Quick access to recent complaints

### Complaints (`/complaints`)
- Complete list of all complaints
- Filter by status, category, search
- View complaint details
- Update complaint status

### Analytics & Reports (`/analytics`)
- Comprehensive analytics dashboard with statistical reports
- Multiple visualization charts (Doughnut, Line, Bar charts)
- Category-wise and district-wise analysis
- Monthly trends and fraud type distribution
- Advanced fraud type analysis (Top 15)
- Date range filtering for custom reports
- Export functionality (CSV and PDF)
- Detailed breakdown tables with percentages

### Users (`/users`)
- Registered users list
- Search functionality
- User details with complaint history

### Settings (`/settings`)
- API configuration
- System health check
- Notification settings

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow Next.js best practices
- Use Tailwind CSS for styling
- Keep components small and reusable

### Component Structure
```tsx
'use client' // If using client-side features

import { useState, useEffect } from 'react'

export default function ComponentName() {
  // Component logic
  return (
    // JSX
  )
}
```

### API Calls
```tsx
import { fetchComplaints } from '@/lib/api'

const data = await fetchComplaints({
  status: 'pending',
  category: 'Financial'
})
```

## Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#1a237e',
    light: '#534bae',
    dark: '#000051',
  },
}
```

### API URL
Change in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

## Troubleshooting

### Issue: Backend not connecting
- Ensure backend is running on port 3000
- Check `.env.local` API URL configuration
- Verify CORS settings in backend

### Issue: Charts not loading
- Install chart.js dependencies: `npm install chart.js react-chartjs-2`
- Clear browser cache and restart

### Issue: Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild

## Production Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual
```bash
npm run build
npm start
```

## Support

For issues or queries:
- **Email**: cybercrime.odisha@gov.in
- **Helpline**: 1930
- **GitHub**: Create an issue in the repository

## License

Government of Odisha - 1930 Cyber Helpline

---

**Built for the Government of Odisha** 🇮🇳
