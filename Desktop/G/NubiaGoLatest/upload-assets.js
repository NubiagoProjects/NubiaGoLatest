const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOkKPN3viR75p4BLuXrmqR_4zlc0X_qL0",
  authDomain: "nubiago-aa411.firebaseapp.com",
  projectId: "nubiago-aa411",
  storageBucket: "nubiago-aa411.firebasestorage.app",
  messagingSenderId: "618017989773",
  appId: "1:618017989773:web:2b1d1c14c2b9e086b52ec4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function uploadFile(filePath, storagePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const storageRef = ref(storage, storagePath);
    
    console.log(`Uploading ${filePath} to ${storagePath}...`);
    await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✅ Uploaded: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading ${filePath}:`, error);
    return null;
  }
}

async function uploadPublicAssets() {
  const publicDir = './public';
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const urlMapping = {};

  try {
    const files = fs.readdirSync(publicDir);
    const imageFiles = files.filter(file => 
      imageExtensions.includes(path.extname(file).toLowerCase())
    );

    console.log(`Found ${imageFiles.length} image files to upload...`);

    for (const file of imageFiles) {
      const filePath = path.join(publicDir, file);
      const storagePath = `assets/images/${file}`;
      
      const downloadURL = await uploadFile(filePath, storagePath);
      if (downloadURL) {
        urlMapping[`/${file}`] = downloadURL;
      }
    }

    // Save URL mapping to a JSON file
    fs.writeFileSync('./public/asset-urls.json', JSON.stringify(urlMapping, null, 2));
    console.log(`\n✅ Upload complete! URL mapping saved to public/asset-urls.json`);
    console.log(`📊 Uploaded ${Object.keys(urlMapping).length} files successfully`);

  } catch (error) {
    console.error('❌ Error uploading assets:', error);
  }
}

uploadPublicAssets();

