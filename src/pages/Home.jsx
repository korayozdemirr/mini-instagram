import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import PostCard from "../components/PostCard";
import UploadForm from "../components/UploadForm";
import { FiHome, FiPlusCircle, FiUser, FiHeart } from "react-icons/fi";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const observerRef = useRef();

  const userPhoto = auth.currentUser?.photoURL;

  // İlk 4 postu çek
  const fetchInitialPosts = async () => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(4)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPosts(data);
    setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === 4);
  };

  // Daha fazla postu çek
  const fetchMorePosts = useCallback(async () => {
    if (!lastVisible || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(4)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts((prev) => [...prev, ...newPosts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      if (snapshot.docs.length < 4) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [lastVisible, loadingMore, hasMore]);

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  // Sonsuz scroll için gözlemci
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Üst bar */}
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">Anasayfa</h1>
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
            <h2 className="font-semibold">Kullanıcı Adı</h2>
            <p className="text-sm text-gray-500">@korayozdemir</p>
          </div>
          <nav className="space-y-3">
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full">
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
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded w-full">
              <FiUser size={20} />
              <span>Profilim</span>
            </button>
          </nav>
        </aside>

        {/* Ana içerik */}
        <main className="flex-1 p-4 max-w-xl mx-auto w-full pb-24">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {loadingMore && <p className="text-center mt-4">Yükleniyor...</p>}
          <div ref={observerRef} className="h-10" />
        </main>
      </div>

      {/* Mobil alt navbar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 md:hidden">
        <button className="flex flex-col items-center text-sm">
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
        <button className="flex flex-col items-center text-sm">
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
                setPosts([]);
                setLastVisible(null);
                setHasMore(true);
                fetchInitialPosts(); // baştan yükle
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}