import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function BookingConfirmation() {
    const { id } = useParams()
    const [booking, setBooking] = useState(null)
    const [loadError, setLoadError] = useState(null)

    useEffect(() => {
        fetch(`http://localhost:8080/bookings/${id}`)
        .then(res => {
            if (!res.ok) throw new Error('Booking not found')
            return res.json()
        })
        .then(data => setBooking(data))
        .catch(() => setLoadError('Booking not found'))
    }, [id])

    if (loadError) {
        return (
        <div className="page">
            <p className="error-text">{loadError}</p>
            <Link to="/" className="btn-secondary" style={{ display: 'inline-block', marginTop: 16 }}>
            Back to flights
            </Link>
        </div>
        )
    }

    if (!booking) {
        return <div className="page"><p>Loading...</p></div>
    }

    return (
        <div className="page">
        <div className="confirmation-card">
            <div className="confirmation-icon">✓</div>
            <h1>Booking Confirmed</h1>
            <p className="confirmation-sub">Your seats are locked in. Safe travels.</p>

            <div className="confirmation-details">
            <div className="confirmation-row">
                <span>Booking ID</span>
                <span style={{ textAlign: 'right' }}>{booking.ID}</span>
            </div>
            <div className="confirmation-row">
                <span>Flight</span>
                <span>{booking.FlightID}</span>
            </div>
            <div className="confirmation-row">
                <span>Status</span>
                <span className="status-badge">{booking.Status}</span>
            </div>
            </div>

            <Link to="/" className="btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
            Book another flight
            </Link>
        </div>
        </div>
    )
}

export default BookingConfirmation