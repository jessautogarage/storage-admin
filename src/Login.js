// src/Login.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in as:", userCredential.user);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};
