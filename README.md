# SeatFlow - Queue & Table Management for Restaurants

A modern, responsive web application for managing restaurant queues and table assignments. Built with Next.js, React, and Tailwind CSS.

## Features

- 👥 **Queue Management** - Track waiting guests with real-time updates
- 🪑 **Table Assignments** - Manage table availability and seating
- 📊 **Analytics** - View queue statistics and performance metrics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Beautiful dark/light theme support
- ⌨️ **Keyboard Shortcuts** - Press 'N' to quickly add a customer

## Deployment

### GitHub Pages (Static)
This version is configured for GitHub Pages static hosting with local storage for data persistence.

Visit: https://Satya6577.github.io/hotel_waitlist_demo

## Local Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- **Frontend**: React 18, Next.js 15
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: React Hooks, Local Storage
- **Animations**: Framer Motion
- **Build Tool**: Next.js with Webpack

## Project Structure

```
├── app/
│   ├── api/          # API routes (for server deployment)
│   ├── page.js       # Main app component
│   └── layout.js     # Root layout
├── components/
│   ├── seatflow/     # Feature components
│   └── ui/           # Reusable UI components
├── lib/
│   └── seatflow/     # Utilities and helpers
└── public/           # Static assets
```

## License

MIT
