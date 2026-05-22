# Warsaw Beauty Salon Explorer

Author: Katsyaryna Anikevich

Warsaw Beauty Salon Explorer is a full-stack web application for browsing real beauty and hair salon data from Warsaw.

The project includes:

- a Python scraper for collecting real salon data from Booksy
- a FastAPI backend API for exposing and updating salon data
- a React frontend for browsing, filtering, viewing, and editing salons
- Supabase PostgreSQL as the database
- Vercel deployment for the full application

## Live version

The application is hosted on Vercel:

```text
https://warsaw-beauty-salon-explorer.vercel.app/
```

Production API:

```text
https://warsaw-beauty-salon-explorer.vercel.app/api/salons
```

Interactive API documentation:

```text
https://warsaw-beauty-salon-explorer.vercel.app/docs
```

The frontend and FastAPI backend are deployed in a single Vercel project. Supabase is used as the production database.

---

## Project structure


```text
Warsaw-Beauty-Salon-Explorer/
├── api/                    # Vercel entry point for the FastAPI backend
├── backend/                # FastAPI application, API routes, schemas and Supabase logic
├── frontend/               # React + TypeScript user interface
├── scraper/                # Python scraper for collecting salon data from Booksy
├── tests/                  # Backend, frontend and scraper tests
├── README.md               # Project documentation
├── package.json            # Root build script for Vercel frontend deployment
├── requirements.txt        # Python dependencies 
└── vercel.json             # Vercel deployment configuration
```

---

## Technology stack

| Part | Technology | Why it was chosen |
|---|---|---|
| Frontend | React | Good for building an interactive user interface with reusable components |
| Frontend language | TypeScript | Adds type safety and makes the code easier to maintain |
| Frontend build tool | Vite | Fast development server and simple production build |
| Backend | FastAPI | Lightweight, fast, and provides automatic API documentation |
| Backend validation | Pydantic | Useful for validating API request and response data |
| Database | Supabase PostgreSQL | Hosted PostgreSQL database with simple integration from Python |
| Scraper | Python | Convenient for web scraping, parsing, and data processing |
| Browser automation | Playwright | Allows collecting data that may require browser interaction |
| Testing | Pytest / frontend tests | Used to check backend, scraper, and frontend behavior |
| Deployment | Vercel | Allows hosting the frontend and backend API in one project |

---

## Data Collection Scraper

The project includes a Python scraper that collects real salon data from Booksy for Warsaw.

The scraper first collects salon profile links from Booksy search pages, then visits each profile and extracts useful information such as address, district, services, prices, rating, reviews, social links, and phone number when available.

The collected data is saved as:

```text
scraper/salons.json
```

### What data is collected

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

### Scraper structure

```text
scraper/
├── config.py       # scraper settings: URLs, limits, headers
├── utils.py        # shared helper functions
├── search.py       # collects salon profile links
├── parsers.py      # parses salon data from profile pages
├── contacts.py     # extracts phone and social links using Playwright
└── main.py         # main scraper entry point
```

### Scraper configuration

Scraper limits can be changed in:

```text
scraper/config.py
```

Example:

```python
PAGES_PER_CATEGORY = 4
TARGET_SALONS = 130
```

The scraper collects more than 100 salons because some records may be duplicated, incomplete, or missing required fields.

### Data quality

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

---

## Backend API

The project includes a FastAPI backend that exposes the collected salon data through a REST API.

The backend uses Supabase PostgreSQL as the database. Salon data is uploaded from `scraper/salons.json` into the `salons` table.

### Backend structure

```text
backend/
├── scripts/upload_to_supabase.py
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
| GET | `/api/salons` | Returns the list of salons with key information |
| GET | `/api/salons/{id}` | Returns full details for a single salon |
| PUT | `/api/salons/{id}` | Allows manual modification of a single salon record |

The list endpoint returns key salon information:

- id
- name
- district
- rating
- reviews count
- price range
- minimum price
- maximum price
- currency

The details endpoint returns full salon information:

- address
- phone
- website
- instagram link
- facebook link
- services
- prices
- rating
- reviews count
- original source URL

Example `PUT` request body:

```json
{
  "phone": "123 456 789",
  "website": "https://example.com"
}
```

### Filters and search

The list endpoint supports filtering, search, and pagination.

| Query | Example |
|---|---|
| Filter by district | `/api/salons?district=Wola` |
| Filter by service | `/api/salons?service=Koloryzacja` |
| Search by salon name | `/api/salons?search=hair` |
| Pagination | `/api/salons?limit=20&offset=0` |

---

## Frontend UI

The project includes a React frontend that consumes the FastAPI backend API.

The frontend allows users to browse salons, filter them, open full salon details, and manually update salon information.

### Frontend features

- salon listing page with key information:
  - name
  - district
  - rating
  - reviews count
  - price range
- search by salon name
- filtering by district
- filtering by service type
- salon details view
- manual editing of salon details
- saving changes through the backend API

### Frontend structure

```text
frontend/
├── src/
│   ├── api/          # API requests to backend
│   ├── components/   # reusable UI components
│   ├── utils/        # helper functions
│   ├── App.tsx       # main application component
│   ├── main.tsx      # React entry point
│   ├── styles.css    # application styles
│   └── types.ts      # shared frontend types
├── package.json
└── vite.config.ts
```

---

## Running manually

The project can be run manually: backend, frontend, and scraper are started separately.

### 1. Backend

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Install backend dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn backend.main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

Local API documentation:

```text
http://localhost:8000/docs
```

### 2. Frontend

Go to the frontend directory:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

### 3. Scraper

Install scraper dependencies:

```bash
cd scraper
python3 -m pip install -r requirements.txt
```

Install Playwright browser:

```bash
python3 -m playwright install chromium
```

Run the scraper:

```bash
cd scraper
python3 main.py
```

The scraper saves the collected data to:

```text
scraper/salons.json
```

### Optional: collecting phone numbers

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

---

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

---

## Environment variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The `.env` file is not committed to GitHub.

---

## Tests

The project includes tests for backend, scraper, and frontend code.

Tests are located in:

```text
tests/
├── backend/
├── frontend/
└── scraper/
```

Run all tests from the project root:

```bash
pytest -v
```

Run only backend tests:

```bash
pytest tests/backend -v
```

Run only scraper tests:

```bash
pytest tests/scraper -v
```

Backend tests use mocked Supabase data, so they do not modify the real database.

---

## What could be improved with more time

With more time, I would improve the project by adding:

- better deduplication and handling of inconsistent salon data
- more advanced filtering and sorting by price, rating, reviews count, and services
- storing separate prices for each procedure, so users could compare specific services more easily
- a more polished mobile version, since the current UI was mainly designed for desktop usage
- authentication for manual data editing
