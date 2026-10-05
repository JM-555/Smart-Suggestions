# Smart Suggestions

A full-stack location-based recommendation web application that helps users find places based on their preferences and location.

## Features

* Search using a manual location or current location
* Choose a context:

  * Date
  * Quick Bite
  * Work
  * Activity
* Filter recommendations by budget
* Set a search radius of 5, 10, or 25 km
* Sort recommendations by distance or rating
* View recommendations on an interactive Google Map
* Click map markers to view place details
* Calculate distances between the user and recommended places

## Tech Stack

**Frontend**

* React
* Vite
* JavaScript
* Google Maps JavaScript API

**Backend**

* Node.js
* Express
* REST API
* Google Places API
* Google Geocoding API

## How It Works

1. The React frontend collects the user's location and preferences.
2. The frontend sends the search criteria to the Express backend through a REST API request.
3. The backend determines the appropriate Google Places search based on the selected context.
4. Google Places API returns potential recommendations.
5. The backend calculates the distance between the user and each place using the Haversine formula.
6. Recommendations are filtered by budget and search radius.
7. Results are sorted by distance or rating.
8. The backend sends the filtered recommendations and user location back to React.
9. React displays the recommendations and locations on an interactive Google Map.

## Project Structure

```text
Smart-Suggestions/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
├── server/
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/JM-555/Smart-Suggestions.git
cd Smart-Suggestions
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal and run:

```bash
cd server
npm install
```

### 4. Configure Google API keys

Create a `.env.local` file inside the `client` folder:

```text
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Create a `.env` file inside the `server` folder:

```text
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

Do not commit these files to GitHub.

### 5. Start the backend

From the `server` folder:

```bash
node index.js
```

The backend runs on:

```text
http://localhost:3000
```

### 6. Start the frontend

From the `client` folder:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Google Cloud APIs

The application uses:

* Google Maps JavaScript API
* Google Places API
* Google Geocoding API

API keys should be stored in environment variables and should never be committed to the repository.

## Future Improvements

* Improve recommendation ranking
* Add additional recommendation categories
* Add more detailed place information
* Improve mobile responsiveness
* Deploy the frontend and backend for public access
