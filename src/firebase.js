import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB0lFtHgIyM9CXVX1f3bC_Bw4I-hRS7yiA",
    authDomain: "warning-system-chat.firebaseapp.com",
    projectId: "warning-system-chat",
    storageBucket: "warning-system-chat.appspot.com",
    messagingSenderId: "171802878658",
    appId: "1:171802878658:web:c253879adebdf97504d15b",
    measurementId: "G-SRV6FBGP82"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, signInWithEmailAndPassword, firestore };