import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Layout from "../components/Layout";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate("/"); // post yoksa anasayfaya at
      }
    };
    fetchPost();
  }, [id, navigate]);

  if (!post) return <p className="text-center mt-10">Yükleniyor...</p>;

  return (
    <Layout>
      <main className="flex-1 p-4 max-w-xl mx-auto w-full">
        <img
          src={post.imageUrl}
          alt={post.caption}
          className="w-full rounded-lg mb-4"
        />
        <h1 className="text-xl font-semibold mb-2">{post.caption}</h1>
        <p className="text-sm text-gray-500">Yükleyen: {post.username}</p>
      </main>
    </Layout>
  );
}