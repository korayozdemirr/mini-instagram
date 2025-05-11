
import React, { useState } from "react";
import { FiHome, FiPlusCircle, FiUser, FiHeart } from "react-icons/fi";
import { auth } from "../firebase";
import UploadForm from "../components/UploadForm";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userPhoto = auth.currentUser?.photoURL;
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Anasayfa";
      case "/profile":
        return "Profil";
      default:
        return "";
    }
  };
  return (
    <div className="flex flex-col min-h-screen">
      {/* Üst Bar */}
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">{getPageTitle()}</h1>
        <FiHeart size={24} />
      </header>

      <div className="flex flex-1 bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r p-4">
          <div className="flex flex-col items-center mb-6">
            <img
              src={userPhoto || "/default-avatar.jpg"}
              alt="Profil"
              className="w-24 h-24 rounded-full mb-2"
            />
            <h2 className="font-semibold">
                {auth.currentUser?.email?.split('@')[0] || 'Anonim'}
            </h2>
            
          </div>
          <nav className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full ${
                location.pathname === "/" ? "bg-gray-100" : ""
              }`}
            >
              <FiHome size={20} />
              <span>Ana Sayfa</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full"
            >
              <FiPlusCircle size={20} />
              <span>Paylaşım Ekle</span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full ${
                location.pathname === "/profile" ? "bg-gray-100" : ""
              }`}
            >
              <FiUser size={20} />
              <span>Profilim</span>
            </button>
          </nav>
        </aside>

        {/* Sayfa içeriği */}
        <main className="flex-1 p-4 max-w-xl mx-auto w-full pb-24">
          {children}
        </main>
      </div>

      {/* Mobil Alt Navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 md:hidden">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center text-sm"
        >
          <FiHome size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center text-sm"
        >
          <FiPlusCircle size={24} />
          <span className="text-xs">Add</span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="flex flex-col items-center text-sm"
        >
          <FiUser size={24} />
          <span className="text-xs">Profile</span>
        </button>
      </nav>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-11/12 max-w-md">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <UploadForm
              onUploadSuccess={() => {
                setShowModal(false);
                // Gerekirse postları yenilemek için props ya da context eklenebilir
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}