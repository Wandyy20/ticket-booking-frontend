import { BrowserRouter, Routes, Route } from 'react-router-dom'
import FlightList from './pages/FlightList'
import FlightDetail from './pages/FlightDetail'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<FlightList />} />
          <Route path="/flights/:id" element={<FlightDetail />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App