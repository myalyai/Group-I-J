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


###Todo::
``` 
Admin Access & Security

Create a separate admin login with enhanced security - done
Admin credentials must be separate from regular user accounts - only user now is admin
Implement role-based access control to restrict prompt management to admins only - only user now is admin
Include IP restriction options for additional security - to do

Complete Prompt Editing
Full text editor for modifying all prompt templates - done
Ability to adjust every aspect of the prompt text - done
Support for formatting, variables, and conditional logic - need polishing
Preview functionality to see how prompts will render - done

Parameter Control
Adjustment of API parameters (temperature, max tokens, etc.) - done
Platform-specific settings for each marketplace done
Content type settings (keywords vs. listings) - done
Default parameter presets with the ability to save custom configurations - done

Testing Environment
Test prompts before publishing changes - need polishing
Sample outputs with different product inputs - need polishing
A/B testing capabilities for comparing prompt effectiveness - to do
Performance metrics for prompt evaluation - to do

1. Logic Editor
Interface for defining how different inputs affect prompt selection
Rules-based system for handling various product types
Customizable preprocessing logic for STL URLs
Decision tree visualization for complex logic flows

2. Variable Management
Define and manage custom variables used in prompts -- done
Create reusable prompt components - done
Control how user inputs are processed and inserted into prompts -- done
Format specifications for variable rendering -- done

3. Platform-Specific Rules
Customize rules for each marketplace independently -- done
Define platform-specific optimizations -- done
Set up specialized handling for different product categories -- done
Marketplace trend adaptations -- to do

4. Analytics Integration
Track prompt performance metrics -- to do
Compare different prompt versions -- no comparing yet, its just going to the newest version
User satisfaction reporting -- to do
Key performance indicators for optimization -- to do
```
