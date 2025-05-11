import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";
import Layout from "../components/Layout";
import UploadForm from "../components/UploadForm";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const observerRef = useRef();

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
    <Layout setShowModal={setShowModal}>
      <main className="flex-1 p-4 max-w-xl mx-auto w-full pb-24">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {loadingMore && <p className="text-center mt-4">Yükleniyor...</p>}
        <div ref={observerRef} className="h-10" />
      </main>

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
                fetchInitialPosts();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}