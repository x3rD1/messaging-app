import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<h1>Welcome!</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
