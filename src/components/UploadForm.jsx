import { useState } from "react";
import { storage, db, auth } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = () => {
    if (!file || !auth.currentUser) return;

    // 1. Storage ref oluştur
    const storageRef = ref(
      storage,
      `posts/${auth.currentUser.uid}/${Date.now()}_${file.name}`
    );

    // 2. Resumable upload başlat
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // opsiyonel: progress takibi
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Upload error:", error);
      },
      async () => {
        // 3. Upload tamamlandığında indirme URL’si al
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 4. Firestore’a kayıt et
        await addDoc(collection(db, "posts"), {
          uid: auth.currentUser.uid,
          username: auth.currentUser.displayName || auth.currentUser.email,
          userPhoto: auth.currentUser.photoURL || null,
          imageUrl: downloadURL,
          caption: title,
          createdAt: serverTimestamp(),
        });

        // temizle
        setFile(null);
        setTitle("");
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0] || null)}
      />
      <input
        type="text"
        placeholder="Foto başlığı..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border rounded"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!file}
      >
        Yükle
      </button>
    </div>
  );
}
