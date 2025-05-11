import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiLogOut, FiEdit2 } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Profile() {
  const [posts, setPosts] = useState([]);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const fetchUserPosts = async () => {
    if (!user) return;
    const q = query(collection(db, "posts"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(data);
  };

  useEffect(() => {
    fetchUserPosts();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Layout>
      <main className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Mobil üst kısım */}
        <div className="flex items-center justify-end mb-4 md:hidden">
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <FiLogOut />
            Çıkış Yap
          </button>
        </div>

        {/* Kullanıcı Bilgisi - Mobil */}
        <div className="flex items-center gap-4 mb-6 md:hidden">
          <img
            src={user?.photoURL || "/default-avatar.jpg"}
            alt="Avatar"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-lg">
              {user?.displayName || user?.email.split('@')[0]}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <button
              onClick={() => alert("Düzenle formu aç")}
              className="mt-1 px-3 py-1 border rounded text-xs flex items-center gap-1"
            >
              <FiEdit2 /> Profili Düzenle
            </button>
          </div>
        </div>

        {/* Kullanıcı Bilgisi - Masaüstü */}
        <div className="hidden md:flex flex-col items-center mb-6">
          <img
            src={user?.photoURL || "/default-avatar.jpg"}
            alt="Avatar"
            className="w-24 h-24 rounded-full mb-2"
          />
          <h2 className="font-semibold">{user?.displayName || auth.currentUser.email?.split('@')[0]}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <button
            onClick={() => alert("Düzenle formu aç")}
            className="mt-2 px-4 py-1 border rounded text-sm flex items-center gap-1"
          >
            <FiEdit2 /> Profili Düzenle
          </button>
          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-red-500 hover:text-red-700"
          >
            <FiLogOut />
            Çıkış Yap
          </button>
        </div>

        {/* Post Sayısı */}
        <p className="mb-2 text-gray-700">Toplam Gönderi: {posts.length}</p>

        {/* Postlar Grid */}
        <div className="grid grid-cols-3 gap-2">
          {posts.map((post) => (
            <img
              key={post.id}
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-32 object-cover cursor-pointer"
              onClick={() => navigate(`/post/${post.id}`)}
            />
          ))}
        </div>
      </main>
    </Layout>
  );
}