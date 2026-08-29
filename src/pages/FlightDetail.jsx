import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PassengerModal from './PassengerModal'

const SERVICE_FEE_PERCENT = 0.05
const PLATFORM_FEE_PERCENT = 0.025

function FlightDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [flight, setFlight] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [passengerNames, setPassengerNames] = useState({})
  const [loadError, setLoadError] = useState(null)
  const [bookingError, setBookingError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:8080/flights/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load flight data')
        }
        return res.json()
      })
      .then(data => setFlight(data))
      .catch(() => setLoadError('Failed to load flight data'))

    fetch(`http://localhost:8080/flights/${id}/seats`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to load seat data')
        }
        return res.json()
      })
      .then(data => setSeats(data))
      .catch(() => setLoadError('Failed to load seat data'))
  }, [id])

  function toggleSeat(seat) {
    if (seat.IsBooked) return

    if (selectedSeats.find(s => s.ID === seat.ID)) {
      setSelectedSeats(
        selectedSeats.filter(s => s.ID !== seat.ID)
      )

      setPassengerNames(prev => {
        const updated = { ...prev }
        delete updated[seat.ID]
        return updated
      })
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  function getSeatStatus(seat) {
    if (seat.IsBooked) return 'booked'
    if (selectedSeats.find(s => s.ID === seat.ID)) return 'selected'
    return 'available'
  }

  function handleNameChange(seatID, name) {
    setPassengerNames({
      ...passengerNames,
      [seatID]: name
    })
  }

  function handleOpenModal() {
    setBookingError(null)
    setShowModal(true)
  }

  async function handleConfirmBooking() {
    setBookingError(null)

    const allFilled = selectedSeats.every(
      seat => passengerNames[seat.ID]?.trim()
    )

    if (!allFilled) {
      setBookingError('Please fill in all passenger names')
      return
    }

    setIsSubmitting(true)

    const payload = {
      flightID: id,
      seats: selectedSeats.map(seat => ({
        seatID: seat.ID,
        passengerName: passengerNames[seat.ID]
      }))
    }

    try {
      const res = await fetch('http://localhost:8080/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const message = await res.text()
        setBookingError(message)
        return
      }

      const booking = await res.json()

      navigate(`/bookings/${booking.ID}`)
    } catch {
      setBookingError('Failed to process booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadError) {
    return <p className="error-text">{loadError}</p>
  }

  if (!flight) {
    return <p>Loading...</p>
  }

  const seatSubtotal = flight.Price * selectedSeats.length
  const totalServiceFee = seatSubtotal * SERVICE_FEE_PERCENT
  const totalPlatformFee = seatSubtotal * PLATFORM_FEE_PERCENT
  const grandTotal =
    seatSubtotal + totalServiceFee + totalPlatformFee

  return (
    <div className="flight-detail-page">
      <h1>
        {flight.Airline} — {flight.Origin} to {flight.Destination}
      </h1>

      <div className="seat-map">
        {seats.map(seat => (
          <button
            key={seat.ID}
            className={`seat seat-${getSeatStatus(seat)}`}
            disabled={seat.IsBooked}
            onClick={() => toggleSeat(seat)}
          >
            {seat.SeatNumber}
          </button>
        ))}
      </div>

      <div className="legend">
        <span>
          <i className="dot dot-available" /> Available
        </span>

        <span>
          <i className="dot dot-selected" /> Selected
        </span>

        <span>
          <i className="dot dot-booked" /> Booked
        </span>
      </div>

      <div className="price-summary">
        <div className="price-row">
          <span>Seats ({selectedSeats.length})</span>
          <span>{seatSubtotal.toLocaleString()}</span>
        </div>

        <div className="price-row">
          <span>Service fee (5%)</span>
          <span>{totalServiceFee.toLocaleString()}</span>
        </div>

        <div className="price-row">
          <span>Platform fee (2.5%)</span>
          <span>{totalPlatformFee.toLocaleString()}</span>
        </div>

        <div className="price-row total">
          <span>Total</span>
          <span>{grandTotal.toLocaleString()}</span>
        </div>

        <button
          className="btn-primary"
          disabled={selectedSeats.length === 0}
          onClick={handleOpenModal}
        >
          Confirm Booking
        </button>
      </div>

      {showModal && (
        <PassengerModal
          selectedSeats={selectedSeats}
          passengerNames={passengerNames}
          onNameChange={handleNameChange}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmBooking}
          error={bookingError}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default FlightDetail