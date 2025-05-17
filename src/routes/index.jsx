import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import PostDetail from "../pages/PostDetail";

export default function AppRouter({ user }) {
  // Kullanıcı henüz belirlenmedi (auth durumu kontrol ediliyor)
  if (user === undefined) {
    return <p className="text-center mt-10">Yükleniyor...</p>;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: user ? <Home /> : <Navigate to="/login" />,
    },
    {
      path: "/login",
      element: !user ? <Login /> : <Navigate to="/" />,
    },
    {
      path: "/profile",
      element: user ? <Profile /> : <Navigate to="/login" />,
    },
    {
      path: "/post/:id",
      element: user ? <PostDetail /> : <Navigate to="/login" />,
    },
  ]);

  return <RouterProvider router={router} />;
}