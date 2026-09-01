import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FlightList from './pages/FlightList'
import FlightDetail from './pages/FlightDetail'
import BookingConfirmation from './pages/BookingConfirmation'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FlightList />} />
          <Route path="/flights/:id" element={<FlightDetail />} />
          <Route path="/bookings/:id" element={<BookingConfirmation />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App