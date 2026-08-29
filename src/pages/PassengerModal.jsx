function PassengerModal({
  selectedSeats,
  passengerNames,
  onNameChange,
  onCancel,
  onConfirm,
  error,
  isSubmitting
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Passenger Details</h2>

        {selectedSeats.map(seat => (
          <div key={seat.ID} className="modal-input-row">
            <label>Seat {seat.SeatNumber}</label>

            <input
              type="text"
              placeholder="Full name"
              value={passengerNames[seat.ID] || ''}
              onChange={(e) =>
                onNameChange(seat.ID, e.target.value)
              }
            />
          </div>
        ))}

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Process Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PassengerModal