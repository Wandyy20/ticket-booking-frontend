import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config'

function airportCode(cityName) {
  return cityName.slice(0, 3).toUpperCase()
}

function FlightList() {
  const [flights, setFlights] = useState([])
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/flights`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load flights')
        return res.json()
      })
      .then(data => setFlights(data))
      .catch(() => setLoadError('Failed to load flights. Is the server running?'))
  }, [])

  return (
    <div className="flight-list-page">
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Ticket Booking</div>
          <h1>Ready for your next trip?</h1>
          <p>Browse open routes, pick your seat, and lock it in — no waiting, no double-booked seats.</p>
          <div className="flight-path">
            <svg viewBox="0 0 400 40" preserveAspectRatio="none">
              <path d="M0,20 Q200,-10 400,20" />
            </svg>
            <span className="plane">✈</span>
          </div>
        </div>
      </div>

      <div className="page">
        {loadError && <p className="error-text">{loadError}</p>}

        <div className="flight-card-list">
          {flights.map(flight => (
            <Link key={flight.ID} to={`/flights/${flight.ID}`} className="boarding-pass">
              <div className="bp-main">
                <div className="bp-route">
                  <span>{airportCode(flight.Origin)}</span>
                  <span className="bp-line" />
                  <span>{airportCode(flight.Destination)}</span>
                </div>
                <div className="bp-cities">{flight.Origin} to {flight.Destination}</div>
                <div className="bp-airline">{flight.Airline}</div>
              </div>
              <div className="bp-stub">
                <div className="bp-price">Rp {flight.Price.toLocaleString()}</div>
                <div className="bp-cta">Select seats →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlightList
