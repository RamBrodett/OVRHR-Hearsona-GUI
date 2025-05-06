import MainApp from "./pages/Main"
import { Routes, Route } from "react-router"

function App() {
  return (
    <Routes>
        <Route path='/'element={<MainApp />}/>
        {/** Put another route here that routes into 404 or buffer page if backend health is bad */}
      </Routes>
  )
}
export default App
