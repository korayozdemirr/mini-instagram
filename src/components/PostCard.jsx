// src/components/PostCard.jsx
import React, { useState, useEffect } from 'react';
import { FiHeart, FiMessageCircle } from 'react-icons/fi';
import { db, auth } from '../firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const userId = auth.currentUser?.uid;
  const hasLiked = likes.includes(userId);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Zaman biçimlendirme
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

  // Gerçek zamanlı veriler
  useEffect(() => {
    const unsubPost = onSnapshot(doc(db, 'posts', post.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikes(data.likes || []);
      }
    });

    const commentsRef = collection(db, 'posts', post.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const unsubComments = onSnapshot(q, (snapshot) => {
      const commentList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentList);
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [post.id]);

  const toggleLike = async () => {
    const postRef = doc(db, 'posts', post.id);
    if (hasLiked) {
      await updateDoc(postRef, { likes: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(userId) });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentRef = collection(db, 'posts', post.id, 'comments');
    await addDoc(commentRef, {
      text: newComment.trim(),
      userId,
      username: auth.currentUser.displayName || 'Anonim',
      userPhoto: auth.currentUser.photoURL || '',
      createdAt: serverTimestamp(),
    });

    setNewComment('');
  };

  return (
    <div className="bg-white rounded-xl shadow mb-4 p-4">
      {/* Kullanıcı bilgisi */}
      <div className="flex items-center mb-2">
        <img
          src={post.userPhoto || 'https://via.placeholder.com/32'}
          alt={post.username}
          className="w-8 h-8 rounded-full mr-2"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{post.username}</span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </div>

      {/* Fotoğraf */}
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
      <div className="flex items-center gap-4 mb-2">
        <button onClick={toggleLike} className="flex items-center">
          <FiHeart size={20} className={hasLiked ? 'text-red-500' : 'text-gray-600'} />
          <span className="ml-1 text-sm">{likes.length}</span>
        </button>
        <div className="flex items-center">
          <FiMessageCircle size={20} className="text-gray-600" />
          <span className="ml-1 text-sm">{comments.length}</span>
        </div>
      </div>

      {/* Yorumlar */}
      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-sm">
            <img
              src={c.userPhoto || 'https://via.placeholder.com/24'}
              alt={c.username}
              className="w-6 h-6 rounded-full"
            />
            <div className="bg-gray-100 px-3 py-1 rounded-lg">
              <span className="font-semibold mr-1">{c.username}</span>
              {c.text}
            </div>
          </div>
        ))}
      </div>

      {/* Yorum Ekleme Alanı */}
      <form onSubmit={handleCommentSubmit} className="mt-3 flex gap-2 items-start">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorum yaz..."
          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm resize-none"
          rows={1}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}