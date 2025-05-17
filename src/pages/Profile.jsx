import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { FiLogOut, FiEdit2 } from "react-icons/fi";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import EditProfileModal from "../components/EditProfileModal";

export default function Profile() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const refreshUser = () => {
    auth.currentUser.reload().then(() => {
      console.log("Profil güncellendi");
    });
  };
  const fetchInitialPosts = useCallback(async () => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(9)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts(data);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 9);
  }, [user]);

  const fetchMorePosts = useCallback(async () => {
    if (!lastVisible || loadingMore || !hasMore) return;

    setLoadingMore(true);

    const q = query(
      collection(db, "posts"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(6)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts((prev) => [...prev, ...newPosts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < 6) setHasMore(false);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [lastVisible, loadingMore, hasMore, user]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMorePosts();
        }
      },
      { threshold: 1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [fetchMorePosts, hasMore]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <Layout>
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={auth.currentUser}
        refreshUser={refreshUser}
      />
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
              {user?.displayName || user?.email.split("@")[0]}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <button
              onClick={() => setIsEditOpen(true)}
              className="mt-2 px-4 py-1 border rounded text-sm flex items-center gap-1"
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
          <h2 className="font-semibold">
            {user?.displayName || user?.email.split("@")[0]}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <button
            onClick={() => setIsEditOpen(true)}
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

        {loadingMore && <p className="text-center mt-4">Yükleniyor...</p>}
        <div ref={observerRef} className="h-10" />
      </main>
    </Layout>
  );
}
