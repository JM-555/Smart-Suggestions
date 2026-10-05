require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

const PORT = 3000

function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371

    const latDifference = (lat2 - lat1) * Math.PI / 180
    const lonDifference = (lon2 - lon1) * Math.PI / 180

    const a =
        Math.sin(latDifference / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(lonDifference / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return earthRadius * c
}

app.get('/', (req, res) => {
    res.send('Smart Suggestions backend is running!')
})



app.post('/api/recommendations', async (req, res) => {
    try {
        let searchTerm = 'restaurants'
        let priceLevel = null

        if (req.body.context === 'date') {
            searchTerm = 'romantic restaurants'
        }
        else if (req.body.context === 'quick-bite') {
            searchTerm = 'quick casual restaurants'
        }
        else if (req.body.context === 'work') {
            searchTerm = 'cafes coffee shops libraries coworking spaces'
        }
        else if (req.body.context === 'activity') {
            searchTerm = 'things to do'
        }

        if (req.body.budget === '$') {
            priceLevel = 'PRICE_LEVEL_INEXPENSIVE'
        }
        else if (req.body.budget === '$$') {
            priceLevel = 'PRICE_LEVEL_MODERATE'
        }
        else if (req.body.budget === '$$$') {
            priceLevel = 'PRICE_LEVEL_EXPENSIVE'
        }

        let userLocation

        if (typeof req.body.latitude === 'number' &&
            typeof req.body.longitude === 'number') {
            userLocation = {
                latitude: req.body.latitude,
                longitude: req.body.longitude
            }
        }
        else {
            const geocodeResponse = await fetch(
                `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(req.body.location)}`,
                {
                    method: 'GET',
                    headers: {
                        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                        'X-Goog-FieldMask': 'results.location',
                    },
                }
            )

            const geocodeData = await geocodeResponse.json()

            userLocation = geocodeData.results[0].location
        }

        const response = await fetch(
            'https://places.googleapis.com/v1/places:searchText',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                    'X-Goog-FieldMask':
                        'places.id,places.displayName,places.formattedAddress,places.priceLevel,places.location,places.rating,places.primaryType,places.types',
                },
                body: JSON.stringify({
                    textQuery: searchTerm,
                    locationBias: {
                        circle: {
                            center: {
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude
                            },
                            radius: 25000
                        }
                    }
                }),
            }
        )

        const data = await response.json()



        const places = data.places || []
        console.log('Google returned:', places.length, 'places')
        console.log('Google places:', places)

        const placesWithDistance = places.map(place => {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                place.location.latitude,
                place.location.longitude
            )


            return {
                ...place,
                distance: distance,

            }
        })

        let maxDistance = null

        if (req.body.distance === '5') {
            maxDistance = 5
        }
        else if (req.body.distance === '10') {
            maxDistance = 10
        }
        else if (req.body.distance === '25') {
            maxDistance = 25
        }

        let filteredPlaces = []

        placesWithDistance.forEach(place => {
            let matchesBudget = true
            let matchesDistance = true

            if (priceLevel !== null) {
                if (place.priceLevel !== undefined && place.priceLevel !== priceLevel) {
                    matchesBudget = false
                }
            }

            if (maxDistance !== null) {
                if (place.distance > maxDistance) {
                    matchesDistance = false
                }
            }

            if (matchesBudget && matchesDistance) {
                filteredPlaces.push(place)
            }
        })


        if (req.body.sortBy === 'distance') {
            filteredPlaces.sort((a, b) => {
                return a.distance - b.distance
            })
        }
        else if (req.body.sortBy === 'rating') {
            filteredPlaces.sort((a, b) => {
                return (b.rating || 0) - (a.rating || 0)
            })
        }

        console.log('Sorted places:', filteredPlaces)

        res.json({
            places: filteredPlaces,
            userLocation: userLocation
        })

    } catch (error) {
        console.error('Error calling Google Places:', error)

        res.status(500).json({
            error: 'Failed to contact Google Places',
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})