import AuthProvider from "./context/AuthProvider";
import Router from "./router";

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
