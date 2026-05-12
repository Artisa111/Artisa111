import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { RestaurantCanvas } from './RestaurantCanvas'
import { ChatInterface } from './ChatInterface'
import { GestureController } from './GestureController'
import './index.css'

function App() {
  const [data, setData] = useState([])
  const [highlightedTables, setHighlightedTables] = useState([])
  const cameraRef = useRef(null)

  useEffect(() => {
    // Fetch initial data
    axios.get('http://localhost:8000/api/data')
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching data:", err))
  }, [])

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-gray-800 shadow-md z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Restaurant 3D Analytics
        </h1>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div> Available
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {/* 3D Scene */}
        <div className="absolute inset-0">
          <RestaurantCanvas
            data={data}
            highlightedTables={highlightedTables}
            cameraRef={cameraRef}
          />
        </div>

        {/* UI Overlays */}
        <GestureController onGesture={(gesture) => {
           if (cameraRef.current) {
             // Gesture x is between 0 and 1. We map it to orbit controls rotation.
             // 0.5 is center.
             const azimuthSpeed = (gesture.x - 0.5) * 0.1;

             // Update the rotation slowly based on hand position
             cameraRef.current.setAzimuthalAngle(cameraRef.current.getAzimuthalAngle() - azimuthSpeed);
             cameraRef.current.update();
           }
        }} />
        <ChatInterface onActionReceived={(action) => {
          if (action.type === 'HIGHLIGHT_TABLE') {
            setHighlightedTables([action.table_id]);
          } else if (action.type === 'HIGHLIGHT_EMPTY_TABLES') {
            const empty = data.filter(t => !t.is_occupied).map(t => t.table_id);
            setHighlightedTables(empty);
          } else if (action.type === 'HIGHLIGHT_LANGUAGE') {
            const byLang = data.filter(t => t.primary_language === action.language).map(t => t.table_id);
            setHighlightedTables(byLang);
          } else {
            setHighlightedTables([]);
          }
        }} />
      </main>
    </div>
  )
}

export default App
