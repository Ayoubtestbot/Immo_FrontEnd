import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBL1vDeKN1Dx5WKj3V0f3yXfC0E9cq4SOA",
  authDomain: "leadimmo-9a856.firebaseapp.com",
  projectId: "leadimmo-9a856",
  storageBucket: "leadimmo-9a856.firebasestorage.app",
  messagingSenderId: "167800287373",
  appId: "1:167800287373:web:86aae46d343426e7bf72c4",
  measurementId: "G-KQZ84N69KL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, storage };
