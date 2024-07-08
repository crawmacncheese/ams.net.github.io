
import './App.css';
import Home from './pages/home';
import Draw from './pages/draw';
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

function App() {


  
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Draw />} />  
        </Routes>
      </Router>
    </div>
  );
}

export default App;
