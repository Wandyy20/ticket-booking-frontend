import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function FlightList() {
    const [flights, setFlights] = useState([])

    useEffect(() => {
        fetch(`http://localhost:8080/flights`)
        .then(res => res.json())
        .then(data => setFlights(data))
    }, [])

    return (
        <div>
            <h1>Available Flights</h1>
            <ul>
                {flights.map(flight => (
                <li key={flight.ID}>
                    <Link to={`/flights/${flight.ID}`}>
                    {flight.Airline} — {flight.Origin} to {flight.Destination} ({flight.Price})
                    </Link>
                </li>
                ))}
            </ul>
        </div>
    )
}

export default FlightList