# Warsaw Beauty Salon Explorer
Author: Katsyaryna Anikevich

## Data Collection Scraper

The project includes a Python scraper that collects real salon data from Booksy for Warsaw.

The scraper first collects salon profile links from Booksy search pages, then visits each profile and extracts useful information such as address, district, services, prices, rating, reviews, social links, and phone number when available.

The collected data is saved as:

```text
salons.json
```

## What data is collected

For each salon, the scraper tries to collect:

- name
- address
- district
- phone number
- instagram link
- facebook link
- website
- services
- price range
- average price
- rating
- number of reviews
- original Booksy profile URL

Phone numbers are only available when the scraper is connected to a logged-in Booksy session. If no logged-in session is available, the scraper still works, but phone numbers may be saved as `null`.

## Scraper structure

```text
scraper/
├── config.py       # scraper settings: URLs, limits, headers
├── utils.py        # shared helpers 
├── search.py       # collects salon profile links
├── parsers.py      # parses salon data from profile pages
├── contacts.py     # extracts phone and social links using Playwright
└── main.py         # main entry point
```

## Installation

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Install Playwright browser:

```bash
python3 -m playwright install chromium
```

## Running the scraper

From the `scraper` directory, run:

```bash
cd scraper
python3 main.py
```

The scraper saves the collected data to:

```text
salons.json
```

## Optional: collecting phone numbers

Booksy shows phone numbers only after login. To collect them, open Chrome with remote debugging:

```bash
google-chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/chrome-booksy"
```

Log in to Booksy in that Chrome window, then run the scraper normally:

```bash
cd scraper
python3 main.py
```

If the logged-in session is available, the scraper will use it to collect phone numbers. Otherwise, it will continue without authorization and phone numbers may be saved as `null`.

## Configuration

Scraper limits can be changed in:

```text
scraper/config.py
```

Example:

```python
PAGES_PER_CATEGORY = 4
TARGET_SALONS = 130
```

I collect more than 100 salons because some records may be duplicated, incomplete, or missing required fields. Humanity remains imperfect, and so does public web data.

## Data quality

The scraper:
- removes duplicate salon profile links
- skips records without required fields
- removes emojis from names, addresses, and services
- stores the original Booksy profile URL in `source_url`
- keeps missing optional fields as `null`

Required fields:

- name
- address
- district

## Backend API

The project includes a FastAPI backend that exposes the collected salon data through a REST API.

The backend uses Supabase PostgreSQL as the database. Salon data is uploaded from `scraper/salons.json` into the `salons` table.

### Backend structure

```text
backend/
├── config.py            # environment variables and settings
├── supabase_client.py   # Supabase client initialization
├── salon.py             # Pydantic schemas
├── salon_service.py     # salon business logic
├── salons.py            # API routes
└── main.py              # FastAPI app entry point
```

### API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salons` | Returns the list of salons with key information: id, name, district, rating, reviews count, price range, minimum price, maximum price and currency |
| GET | `/api/salons/{id}` | Returns full details for a single salon: address, phone, website, social media links, services, prices, rating, reviews count and original source URL |
| PUT | `/api/salons/{id}` | Allows manual modification of a single salon record |

Example `PUT` request body:

```json
{
  "phone": "123 456 789",
  "website": "https://example.com"
}
```

### Filters and search

The list endpoint supports filtering and search:

| Query | Example |
|---|---|
| Filter by district | `/api/salons?district=Wola` |
| Filter by service | `/api/salons?service=Koloryzacja` |
| Search by salon name | `/api/salons?search=hair` |
| Pagination | `/api/salons?limit=20&offset=0` |

## Deployment and running locally

The application can be run locally or viewed online on Vercel.

### Live version

The project is hosted on Vercel:

```text
https://warsaw-beauty-salon-explorer.vercel.app/
```

Production API:

```text
https://warsaw-beauty-salon-explorer.vercel.app/api/salons
```

Interactive API documentation:

```text
https://your-vercel-link.vercel.app/docs
```

The frontend and FastAPI backend are deployed in a single Vercel project. Supabase is used as the production database.

### Running locally

To run the backend locally, create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Then install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

The local API will be available at:

```text
http://localhost:8000
```

Local API documentation:

```text
http://localhost:8000/docs
```


### Environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The `.env` file is not committed to GitHub.

## Uploading data to Supabase

Salon data can be uploaded to Supabase with:

```bash
python3 scripts/upload_to_supabase.py
```

The script reads data from:

```text
scraper/salons.json
```

and uploads it to the `salons` table.

## Tests

The project includes tests for both the scraper and backend.

Tests are located in:

```text
tests/
├── scraper/
└── backend_tests/
```

Run all tests from the project root:

```bash
pytest -v
```

Run only backend tests:

```bash
pytest tests/backend_tests -v
```

Backend tests use mocked Supabase data, so they do not modify the real database.
