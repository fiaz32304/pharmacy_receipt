# Pharmacy Receipts Application

A fully functional web application for managing pharmacy receipts with Supabase backend and Vite frontend.

## Features

- Add new pharmacy receipts with pharmacy name, patient name, items, and total amount
- View all receipts in a responsive list with formatted data
- Separate display of medicines and quantities for better readability
- Download individual receipts as HTML files
- Print receipts directly from the browser (SMS-style printing)
- Real-time data synchronization with Supabase
- Responsive design using Bootstrap 5
- Loading indicators and success/error alerts
- Automatic calculation of total amount based on medicines

## Tech Stack

- **Frontend**: Vite + Vanilla JavaScript + Bootstrap 5
- **Backend**: Supabase (Database + Authentication)
- **Package Manager**: npm
- **Deployment**: Vercel

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Supabase account (free tier available)

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase](https://app.supabase.com/) and create a new project
2. Note down your project URL and anon key from Settings > API

### 2. Set Up Database

1. In your Supabase project, go to SQL Editor
2. Run the SQL script from [`supabase/create_table.sql`](supabase/create_table.sql):

```sql
-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_name TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts (created_at DESC);
```

### 3. Local Development Setup

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`

### 4. Deployment to Vercel

1. Push your code to a GitHub repository
2. Sign up/log in to [Vercel](https://vercel.com/)
3. Create a new project and import your GitHub repository
4. Configure environment variables in Vercel:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
5. Deploy the project

Vercel will automatically detect the Vite project and configure the build settings.

## Project Structure

```
pharmacy-receipts/
├── index.html           # Main HTML file
├── package.json         # Project dependencies and scripts
├── vite.config.js       # Vite configuration
├── .env.example         # Example environment variables
├── README.md            # This file
├── supabase/
│   └── create_table.sql # SQL script to create receipts table
├── src/
│   ├── main.js          # Main application logic
│   ├── api.js           # Supabase API functions
│   └── styles.css       # Custom CSS styles
└── dist/                # Built files (generated after build)
```

## API Functions

The application uses two main functions to interact with Supabase:

- `getReceipts()`: Fetches all receipts ordered by creation date (descending)
- `addReceipt(data)`: Inserts a new receipt into the database

## Data Format

Receipts are stored with the following structure:

```json
{
  "id": "uuid",
  "pharmacy_name": "string",
  "patient_name": "string",
  "items": [
    {
      "name": "string",
      "qty": "number",
      "price": "number"
    }
  ],
  "total": "number",
  "created_at": "timestamp"
}
```

Example items JSON:
```json
[
  {
    "name": "Paracetamol",
    "qty": 2,
    "price": 5.99
  },
  {
    "name": "Vitamin C",
    "qty": 1,
    "price": 12.50
  }
]
```

## Using the Application

### Adding a New Receipt

1. Fill in the pharmacy name and patient name
2. Add medicine items using the "Add Another Medicine" button
3. For each medicine, enter:
   - Medicine name
   - Quantity
   - Price per unit
4. The total amount is automatically calculated
5. Click "Add Receipt" to save

### Managing Receipts

Each receipt in the list displays:
- Pharmacy name
- Patient name
- Creation date and time
- Total amount
- Separate sections for medicines and quantities

### Downloading and Printing Receipts

Each receipt has two action buttons:
1. **Download**: Generates and downloads an HTML receipt file
2. **Print**: Opens a print dialog to print the receipt directly

When a new receipt is added, it is automatically printed (SMS-style printing).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These variables are accessed in the JavaScript code using:
- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

## Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally

## Troubleshooting

1. **Environment variables not loading**: Make sure your `.env` file is in the root directory and variables are prefixed with `VITE_`
2. **CORS errors**: Ensure your Supabase URL is correct and your Supabase project is properly configured
3. **Database connection issues**: Verify your Supabase anon key and project URL are correct

## License

This project is open source and available under the MIT License.