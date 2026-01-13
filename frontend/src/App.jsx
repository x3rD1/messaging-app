import AuthProvider from "./context/AuthProvider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import routes from "./router.jsx";

const router = createBrowserRouter(routes);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
