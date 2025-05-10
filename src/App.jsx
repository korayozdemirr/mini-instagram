import { useEffect, useState } from "react";
import AppRouter from "./routes"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    }
    );
    return () => {
      unsub();
    };
  }, []);

  return (
    <AppRouter user={user}/>
  )
}

export default App
