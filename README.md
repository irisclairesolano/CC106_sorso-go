# Sorsogon Tourism Website

A modern, responsive tourism website for Sorsogon, showcasing its beautiful destinations, local stories, and cultural festivals. Built with Next.js and Supabase.

## 🌟 Features


- **Destination Showcase** - Browse through Sorsogon's beautiful destinations
- **Story Sharing** - Read and share travel experiences
- **Event Calendar** - Stay updated with local festivals and events
- **Admin Dashboard** - Content management system for administrators
- **Responsive Design** - Works on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **State Management**: React Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based session management
- **Deployment**: Vercel
- **Maps**: Mapbox GL JS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Mapbox access token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sorsogon-tourism.git
   cd sorsogon-tourism
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Mapbox credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
ADMIN_EMAIL=admin@sorsogo.ph
ADMIN_PASSWORD=sorsogo2025
ADMIN_SESSION_SECRET=c4ee09bc2b5502ad36c21342fab459fbe996a2116e430bb9b2d32da33a5f0105
NEXT_PUBLIC_SUPABASE_URL=https://aaroniaystighbdelips.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9uaWF5c3RpZ2hiZGVsaXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MzA5NTYsImV4cCI6MjA3OTAwNjk1Nn0.Rq94y_cWudYGBluB1vwSC5pv17iVZUwGrcww1lNpMOk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcm9uaWF5c3RpZ2hiZGVsaXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQzMDk1NiwiZXhwIjoyMDc5MDA2OTU2fQ.4yTTn74t3Ml8rgawlQuYhmFwhkQVh1UjL9T0IT_HxJs
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiaXJpc3RoZWZsbG93ZXIiLCJhIjoiY21pOGMyejFnMDh6aTJrczlrMnVpeHhnOCJ9.cVwqkA5utJ3L31h0QlL7AQ
```

## 📂 Project Structure

```
├── app/                 # App router pages and API routes
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── public/              # Static assets
├── styles/              # Global styles and Tailwind config
└── supabase-schema.sql  # Database schema definition
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🤝 Group Members

- CHUA, Kyla
- CONDE, Shenna Mea
- HABLA, Scott Denver
- SOLANO, Iris Claire D.
- TEODOCIO, Cyrene Jane 


---

Built with ❤️ for Sorsogon Tourism
