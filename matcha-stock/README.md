# Matcha Stock Tracker

A web application that tracks the availability of matcha products from various brands and sends notifications when out-of-stock items become available again.

## Features

- Real-time stock tracking for matcha products from popular brands (Ippodo, Rocky's Matcha)
- Browse products by brand or stock status
- Sign up for SMS notifications when out-of-stock products become available
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Apollo Client
- **Backend**: Next.js API Routes, Apollo Server, GraphQL
- **Database**: PostgreSQL (via Prisma ORM)
- **Scrapers**: Python, Playwright
- **Notifications**: Twilio SMS

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python 3.8+
- PostgreSQL database

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/matcha_stock?schema=public"
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"
JWT_SECRET="your_jwt_secret"
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/matcha-stock.git
   cd matcha-stock
   ```

2. Install NPM dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npx prisma migrate dev --name init
   ```

4. Set up Python environment for scrapers:
   ```
   cd scrapers
   python -m pip install -r requirements.txt
   ```

### Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Run the matcha stock scraper:
   ```
   cd scrapers
   python matcha_scraper.py
   ```

3. Run the notification sender:
   ```
   cd scrapers
   python notification_sender.py
   ```

## Project Structure

- `/src` - Next.js application code
  - `/app` - App router pages
  - `/components` - React components
  - `/graphql` - GraphQL schema, resolvers, and client queries
  - `/utils` - Utility functions
- `/prisma` - Prisma schema and migrations
- `/scrapers` - Python scripts for scraping matcha websites

## Deployment

The application can be deployed using Vercel (for the frontend and API) and scheduled jobs (for the scrapers). For the database, a managed PostgreSQL service like Supabase or AWS RDS is recommended.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
