import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDBzT1TBMJYhbAPSaaHemzRUjsxEFTSXNo",
  authDomain: "taberoku-bd1c9.firebaseapp.com",
  databaseURL: "https://taberoku-bd1c9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "taberoku-bd1c9",
  storageBucket: "taberoku-bd1c9.firebasestorage.app",
  messagingSenderId: "167022079252",
  appId: "1:167022079252:web:c8b967ee264efda19ba601",
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
