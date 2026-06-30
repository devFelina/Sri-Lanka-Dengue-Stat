import { Route, Routes } from "react-router-dom";

import About from "./pages/About";
import Compare from "./pages/Compare";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/compare" element={<Compare />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
