// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { db, auth } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';

export default function PostCard({ post }) {
  // createdAt field may be Firestore timestamp or JS timestamp
  let dateObj;
  if (post.createdAt?.toDate) {
    dateObj = post.createdAt.toDate();
  } else if (post.createdAt) {
    dateObj = new Date(post.createdAt);
  } else {
    dateObj = new Date();
  }
  const formattedDate = dateObj.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const [likes, setLikes] = useState(post.likes || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const userId = auth.currentUser?.uid;
  const hasLiked = likes.includes(userId);

  const [imgLoaded, setImgLoaded] = useState(false);

  // Real-time updates for likes and comments count
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'posts', post.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikes(data.likes || []);
        setCommentsCount(data.commentsCount || 0);
      }
    });
    return () => unsub();
  }, [post.id]);

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (hasLiked) {
      await updateDoc(postRef, { likes: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(userId) });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow mb-4 p-4">
      {/* Kullanıcı bilgisi */}
      <div className="flex items-center mb-2">
        {!post.userPhoto && (
          <div className="w-8 h-8 bg-gray-300 rounded-full mr-2 animate-pulse" />
        )}
        {post.userPhoto && (
          <img
            src={post.userPhoto}
            alt={post.username}
            className="w-8 max-h-[60vh] rounded-full mr-2"
            loading="lazy"
          />
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{post.username}</span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </div>

      {/* Fotoğraf (Skeleton + Lazy) */}
      <div className="relative w-full mb-2">
        {!imgLoaded && (
          <div className="w-full h-[80vh] bg-gray-200 animate-pulse rounded-md" />
        )}
        <img
          src={post.imageUrl}
          alt={post.caption}
          className={`w-full max-h-[calc(100vh-150px)] rounded-md object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>

      {/* Açıklama */}
      {post.caption && (
        <p className="text-sm text-gray-700 mb-2">{post.caption}</p>
      )}

      {/* Like & Comment Butonları */}
      <div className="flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center">
          <FiHeart size={20} className={hasLiked ? 'text-red-500' : 'text-gray-600'} />
          <span className="ml-1 text-sm">{likes.length}</span>
        </button>
        <button className="flex items-center">
          <FiMessageCircle size={20} className="text-gray-600" />
          <span className="ml-1 text-sm">{commentsCount}</span>
        </button>
      </div>
    </div>
  );
}
