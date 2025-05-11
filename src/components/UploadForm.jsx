import { useState } from "react";
import { storage, db, auth } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function UploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 👈 progress state

  const handleUpload = () => {
    if (!file || !auth.currentUser) return;

    setIsUploading(true);
    setProgress(0);

    const storageRef = ref(
      storage,
      `posts/${auth.currentUser.uid}/${Date.now()}_${file.name}`
    );

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog); // 👈 progress güncelle
      },
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        await addDoc(collection(db, "posts"), {
          uid: auth.currentUser.uid,
          username: auth.currentUser.displayName || auth.currentUser.email,
          userPhoto: auth.currentUser.photoURL || null,
          imageUrl: downloadURL,
          caption: title,
          createdAt: serverTimestamp(),
        });

        setFile(null);
        setTitle("");
        setIsUploading(false);
        setProgress(0); // reset progress

        if (onUploadSuccess) onUploadSuccess();
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
        disabled={!file || isUploading || !title}
      >
        {isUploading ? "Yükleniyor..." : "Yükle"}
      </button>

      {/* 👇 Progress Bar */}
      {isUploading && (
        <div className="flex flex-col gap-1">
          <div className="w-full bg-gray-300 rounded h-3 overflow-hidden">
            <div
              className="bg-blue-500 h-3 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-700 text-center">
            %{Math.round(progress)} yüklendi
          </span>
        </div>
      )}
    </div>
  );
}
