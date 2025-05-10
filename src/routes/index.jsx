import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
// import Profile from "../pages/Profile";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
//   { path: "/profile/:id", element: <Profile /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
