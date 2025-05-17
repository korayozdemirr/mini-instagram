import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";  // Storage importunu unutma

export default function EditProfileModal({ isOpen, onClose, user, refreshUser }) {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setUploading(true);
    let updatedPhotoURL = photoURL;

    // Eğer dosya seçildiyse Storage'a yükle
    if (photoFile) {
      const storageRef = ref(storage, `profilePhotos/${user.uid}/${photoFile.name}`);
      await uploadBytes(storageRef, photoFile);
      updatedPhotoURL = await getDownloadURL(storageRef);
      setPhotoURL(updatedPhotoURL); // Güncel URL'yi state'e de koy
    }

    await updateProfile(user, {
      displayName,
      photoURL: updatedPhotoURL,
    });

    refreshUser(); // Parent component'ten profili yenile
    setUploading(false);
    onClose(); // Modalı kapat
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Panel className="bg-white p-6 rounded shadow max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-4">Profili Düzenle</Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">İsim</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border rounded px-3 py-1 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profil Fotoğrafı</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {photoURL && (
                <img
                  src={photoURL}
                  alt="Profil Önizleme"
                  className="mt-2 w-24 h-24 rounded-full object-cover"
                />
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={uploading}
              className={`w-full px-4 py-2 rounded mt-4 text-white ${
                uploading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {uploading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}