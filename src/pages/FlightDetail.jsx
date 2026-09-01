import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PassengerModal from './PassengerModal'
import { API_URL } from '../config'

const SERVICE_FEE_PERCENT = 0.05
const PLATFORM_FEE_PERCENT = 0.025

function groupSeatsByRow(seats) {
  const rows = {}
  seats.forEach(seat => {
    const match = seat.SeatNumber.match(/\d+/)
    const rowNum = match ? match[0] : '0'
    if (!rows[rowNum]) rows[rowNum] = []
    rows[rowNum].push(seat)
  })

  return Object.entries(rows)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([rowNum, rowSeats]) => ({
      rowNum,
      seats: [...rowSeats].sort((a, b) => a.SeatNumber.localeCompare(b.SeatNumber))
    }))
}

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
    fetch(`${API_URL}/flights/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load flight data')
        return res.json()
      })
      .then(data => setFlight(data))
      .catch(() => setLoadError('Failed to load flight data'))

    fetch(`${API_URL}/flights/${id}/seats`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load seat data')
        return res.json()
      })
      .then(data => setSeats(data))
      .catch(() => setLoadError('Failed to load seat data'))
  }, [id])

  function toggleSeat(seat) {
    if (seat.IsBooked) return

    if (selectedSeats.find(s => s.ID === seat.ID)) {
      setSelectedSeats(selectedSeats.filter(s => s.ID !== seat.ID))
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
    setPassengerNames({ ...passengerNames, [seatID]: name })
  }

  function handleOpenModal() {
    setBookingError(null)
    setShowModal(true)
  }

  async function handleConfirmBooking() {
    setBookingError(null)

    const allFilled = selectedSeats.every(seat => passengerNames[seat.ID]?.trim())
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
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const message = await res.text()
        setBookingError(message)
        return
      }

      const booking = await res.json()
      console.log('booking created:', booking)
      navigate(`/bookings/${booking.ID}`)
    } catch  {
      setBookingError('Failed to process booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadError) {
    return <div className="page"><p className="error-text">{loadError}</p></div>
  }

  if (!flight) {
    return <div className="page"><p>Loading...</p></div>
  }

  const seatSubtotal = flight.Price * selectedSeats.length
  const totalServiceFee = seatSubtotal * SERVICE_FEE_PERCENT
  const totalPlatformFee = seatSubtotal * PLATFORM_FEE_PERCENT
  const grandTotal = seatSubtotal + totalServiceFee + totalPlatformFee

  const rows = groupSeatsByRow(seats)

  return (
    <div className="page flight-detail-page">
      <div className="flight-detail-header">
        <h1>{flight.Origin} to {flight.Destination}</h1>
        <p>{flight.Airline}</p>
      </div>

      <div className="cabin">
        <div className="cabin-nose" />
        <div className="cabin-rows">
          {rows.map(row => (
            <div className="seat-row" key={row.rowNum}>
              <span className="row-number">{row.rowNum}</span>
              <div className="row-seats">
                {row.seats.map(seat => (
                  <button
                    key={seat.ID}
                    className={`seat seat-${getSeatStatus(seat)}`}
                    disabled={seat.IsBooked}
                    onClick={() => toggleSeat(seat)}
                    title={seat.SeatNumber}
                  >
                    {seat.SeatNumber}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="legend">
        <span><i className="dot dot-available" /> Available</span>
        <span><i className="dot dot-selected" /> Selected</span>
        <span><i className="dot dot-booked" /> Booked</span>
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
          <span>Rp {grandTotal.toLocaleString()}</span>
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
