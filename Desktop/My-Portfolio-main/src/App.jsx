import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainpage from "./Mainpage";
import Lastpage from "./2ndpage/Lastpage";



function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mainpage />} id='firstone'/>
        <Route path="/lastpage" element={<Lastpage />} />
      </Routes>
    </Router>

  );
}

export default App;
