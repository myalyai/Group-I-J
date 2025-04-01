# 3D Print Listing Optimizer

A Next.js application for optimizing 3D print product listings across different platforms using AI-generated keywords.

## Features

- **Guest Access**: Public landing page for generating optimized keywords
- **Admin Dashboard**: Secure admin interface for managing prompts and settings
- **Multi-Platform Support**: Works with various e-commerce platforms
- **Category-Based Optimization**: Platform-specific keyword generation
- **Version Control**: Track and manage different versions of prompts

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **AI Integration**: n8n Webhook

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- n8n webhook access

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://myalyai.app.n8n.cloud/webhook/keywords
N8N_WEBHOOK_USERNAME=admin
N8N_WEBHOOK_PASSWORD=your_password
```

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd admin-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
admin-dashboard/
├── app/
│   ├── dashboard/     # Admin dashboard routes
│   ├── login/        # Login page
│   └── page.tsx      # Public landing page
├── components/       # Reusable components
├── config/          # Configuration files
├── contexts/        # React contexts
├── lib/            # Utility functions and clients
├── types/          # TypeScript type definitions
└── public/         # Static assets
```

## Features in Detail

### Public Landing Page
- Platform selection
- Category selection
- Product description input
- AI-powered keyword generation
- Real-time results display

### Admin Dashboard
- Secure authentication
- Prompt management
- Version control
- Platform and category management
- Model selection
- Temperature and token controls

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Staging
npm run build:staging # Build for staging
npm run start:staging # Start staging server
```

### Database Schema

#### Platforms
- `id`: number
- `name`: string

#### Categories
- `id`: number
- `name`: string

#### Prompts
- `id`: number
- `platform_id`: number
- `category_id`: number
- `model_id`: number
- `version`: number
- `prompt_text`: string
- `temperature`: number
- `max_tokens`: number
- `is_active`: boolean

## Deployment

The application can be deployed on any platform that supports Next.js applications. Recommended platforms:

- Vercel (recommended)
- Netlify
- AWS
- DigitalOcean

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

