import Login from "./components/Login";
import Signup from "./components/Signup";
import Socket from "./components/Socket";
import ProtectedRoute from "./components/ProtectedRoute";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Socket />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
];

export default routes;
