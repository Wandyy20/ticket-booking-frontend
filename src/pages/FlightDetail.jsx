import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function FlightDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flight, setFlight] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [passengerNames, setPassengerNames] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(`http://localhost:8080/flights/${id}`)
      .then(res => res.json())
      .then(data => setFlight(data))

    fetch(`http://localhost:8080/flights/${id}/seats`)
      .then(res => res.json())
      .then(data => setSeats(data))
  }, [id])

  function toggleSeat(seatID) {
    if (selectedSeats.includes(seatID)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatID))
      // KALAU KURSI DI-UNCHECK, HAPUS JUGA nama yang udah diisi
      const updated = { ...passengerNames }
      delete updated[seatID]
      setPassengerNames(updated)
    } else {
      setSelectedSeats([...selectedSeats, seatID])
    }
  }

  function handleNameChange(seatID, name) {
    setPassengerNames({ ...passengerNames, [seatID]: name })
  }

  function findSeatBySeatID(seatID) {
    return seats.find(s => s.ID === seatID)
  }

  async function handleBooking() {
    setError(null)

    // VALIDASI SEDERHANA: pastiin SEMUA kursi yang dipilih udah ada nama-nya
    const allNamesFilled = selectedSeats.every(seatID => passengerNames[seatID]?.trim())
    if (!allNamesFilled) {
      setError('Please fill in all passenger names')
      return
    }

    const payload = {
      flightID: id,
      seats: selectedSeats.map(seatID => ({
        seatID: seatID,
        passengerName: passengerNames[seatID]
      }))
    }

    const res = await fetch('http://localhost:8080/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const message = await res.text()
      setError(message)
      return
    }

    const booking = await res.json()
    navigate(`/bookings/${booking.ID}`)
  }

  if (!flight) return <p>Loading...</p>

  return (
    <div>
      <h1>{flight.Airline} — {flight.Origin} to {flight.Destination}</h1>
      <p>Price: {flight.Price}</p>

      {/* SECTION 1: PILIH KURSI */}
      <h2>Select Seats</h2>
      <ul>
        {seats.map(seat => (
          <li key={seat.ID}>
            <label>
              <input
                type="checkbox"
                disabled={seat.IsBooked}
                checked={selectedSeats.includes(seat.ID)}
                onChange={() => toggleSeat(seat.ID)}
              />
              {seat.SeatNumber} — {seat.IsBooked ? 'Booked' : 'Available'}
            </label>
          </li>
        ))}
      </ul>

      {/* SECTION 2: ISI DATA PENUMPANG, CUMA MUNCUL KALAU ADA KURSI DIPILIH */}
      {selectedSeats.length > 0 && (
        <div>
          <h2>Passenger Details</h2>
          {selectedSeats.map(seatID => {
            const seat = findSeatBySeatID(seatID)
            return (
              <div key={seatID}>
                <label>Seat {seat?.SeatNumber}: </label>
                <input
                  type="text"
                  placeholder="Passenger name"
                  value={passengerNames[seatID] || ''}
                  onChange={(e) => handleNameChange(seatID, e.target.value)}
                />
              </div>
            )
          })}

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button onClick={handleBooking}>
            Confirm Booking ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})
          </button>
        </div>
      )}
    </div>
  )
}

export default FlightDetail