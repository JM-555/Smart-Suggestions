import { useState, useEffect } from 'react'
import './App.css'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'


function MapController({ userCoordinates }) {
  const map = useMap()

  function panMapToCoordinates(latitude, longitude) {
    map.panTo({
      lat: latitude,
      lng: longitude,
    })
  }

  useEffect(() => {
    if (map && userCoordinates) {
      console.log('MAP PAN COORDINATES:', userCoordinates)
      panMapToCoordinates(
        userCoordinates.latitude,
        userCoordinates.longitude
      )
    }
  }, [map, userCoordinates])

  return null
}

function App() {
  const [location, setLocation] = useState('')
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false)
  const [context, setContext] = useState('')
  const [budget, setBudget] = useState('')
  const [distance, setDistance] = useState('')
  const [sortBy, setSortBy] = useState('distance')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userCoordinates, setUserCoordinates] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null)



  async function handleSearch() {
    console.log('BUTTON WAS CLICKED')

    setLoading(true)
    setError('')



    try {
      console.log('SENDING TO BACKEND:', {
        location: location,
        latitude: userCoordinates ? userCoordinates.latitude : null,
        longitude: userCoordinates ? userCoordinates.longitude : null,
        context: context,
        budget: budget,
        distance: distance,
        sortBy: sortBy,
      })


      const response = await fetch('http://localhost:3000/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          latitude: userCoordinates ? userCoordinates.latitude : null,
          longitude: userCoordinates ? userCoordinates.longitude : null,
          context: context,
          budget: budget,
          distance: distance,
          sortBy: sortBy,
        }),
      })

      console.log('RESPONSE RECEIVED')

      if (!response.ok) {
        throw new Error('Failed to get recommendations')
      }

      const data = await response.json()

      console.log('BACKEND DATA:', JSON.stringify(data, null, 2))

      setPlaces(data.places)
      setUserCoordinates(data.userLocation)
    }
    catch (error) {
      console.error('SEARCH ERROR:', error)

      setError('Something went wrong. Please try again.')
      setPlaces([])
    }
    finally {
      setLoading(false)
    }
  }

  function handleUseCurrentLocation() {
    console.log('REQUESTING CURRENT LOCATION')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        console.log('CURRENT LOCATION:', latitude, longitude)

        setUserCoordinates({
          latitude: latitude,
          longitude: longitude,
        })
        setUsingCurrentLocation(true)
      },
      (error) => {
        console.error('LOCATION ERROR:', error)

        setError('Unable to get your current location.')
      }
    )
  }


  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div>

        <h1>Smart Suggestions</h1>

        <div className="search-panel">

          <div className="filter-group">
            <label>Location:</label>
            <input
              type="text"
              value={usingCurrentLocation ? 'Using your current location' : location}
              onChange={(event) => {
                setLocation(event.target.value)
              }}
              onFocus={() => {
                if (usingCurrentLocation) {
                  setUsingCurrentLocation(false)
                  setUserCoordinates(null)
                  setLocation('')
                }
              }}
              placeholder="Enter a location"
            />
            <button onClick={handleUseCurrentLocation}>
              Use My Current Location
            </button>
          </div>

          <div className="filter-group">
            <label>Context:</label>
            <select
              value={context}
              onChange={(event) => setContext(event.target.value)}
            >
              <option value="">Select context</option>
              <option value="date">Date</option>
              <option value="quick-bite">Quick Bite</option>
              <option value="work">Work</option>
              <option value="activity">Activity</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Budget:</label>
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            >
              <option value="">Select budget</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search Radius:</label>
            <select
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            >
              <option value="">Select radius</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <button onClick={handleSearch}>
            Find Suggestions
          </button>

        </div>
        <div className="map-container">
          <Map

            defaultCenter={{
              lat: 43.7315,
              lng: -79.7624,
            }}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
          >
            <MapController userCoordinates={userCoordinates} />

            {places.map((place) => (
              <AdvancedMarker
                key={place.id || place.displayName.text}
                position={{
                  lat: place.location.latitude,
                  lng: place.location.longitude,
                }}
                title={place.displayName.text}
                onClick={() => setSelectedPlace(place)}
              />
            ))}
            {selectedPlace && (
              <InfoWindow
                position={{
                  lat: selectedPlace.location.latitude,
                  lng: selectedPlace.location.longitude,
                }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div>
                  <h3>{selectedPlace.displayName.text}</h3>
                  <p>Rating: {selectedPlace.rating || 'N/A'}</p>
                  <p>{selectedPlace.distance.toFixed(2)} km away</p>
                  <p>{selectedPlace.formattedAddress}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>

        {loading && <p>Finding suggestions...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && places.length === 0 && (
          <p>No suggestions found. Try changing your filters.</p>
        )}

        <div>
          <h2>Recommendations</h2>

          {places.map((place) => (
            <div
              key={place.id || place.displayName.text}
              className="recommendation-card"
            >
              <h3>{place.displayName.text}</h3>

              <p>
                {place.primaryType || 'Place'}
              </p>

              <p>
                Rating: {place.rating || 'N/A'}
              </p>

              <p>
                Price: {place.priceLevel || 'N/A'}
              </p>

              <p>
                {place.distance.toFixed(2)} km away
              </p>

              <p>
                {place.formattedAddress}
              </p>
            </div>

          ))}
        </div>

      </div>
    </APIProvider>
  )
}
export default App
