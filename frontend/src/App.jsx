import { Outlet } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./App.css";

function App() {
  return (
    <>
      <main className="text-center flex-grow h-full">
        <Outlet />
      </main>
    </>
  );
}

export default App;

