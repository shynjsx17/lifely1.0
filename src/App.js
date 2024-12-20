import Home from "./Components/Home";
import Sidebar from "./Navigation/Sidebar";
import ArchiveComponent from "./Components/ArchiveComponent";
import MyDiary from "./Components/MyDiary";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/Sidebar" element={<Sidebar/>}/>
            <Route path="/ArchiveComponent" element={<ArchiveComponent/>}/>
            <Route path="/MyDiary" element={<MyDiary/>}/>
          </Routes>
        </Router>
    </div>
  );
}

export default App;