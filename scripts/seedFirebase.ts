import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, deleteDoc, getDocs } from "firebase/firestore";
import * as dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Resolving paths to work with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("Firebase config loaded for project:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import all static mock data
import { recentAlerts, notifications } from '../src/data/alerts';
import { claims } from '../src/data/claims';
import { kpiCards, riskDistribution, anomalyBreakdown, quickActions } from '../src/data/dashboard';

async function clearCollection(collectionName: string) {
  console.log(`Clearing existing data in [${collectionName}]...`);
  const snapshot = await getDocs(collection(db, collectionName));
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`Cleared ${deletePromises.length} documents from [${collectionName}].`);
}

async function seedData() {
  console.log("Seeding started...");

  // 1. Clear collections to avoid duplication if ran multiple times
  await clearCollection('alerts');
  await clearCollection('notifications');
  await clearCollection('claims');
  await clearCollection('kpi_cards');
  await clearCollection('risk_distribution');
  await clearCollection('anomaly_breakdown');
  await clearCollection('quick_actions');

  // 2. Insert data
  console.log("Inserting Alerts...");
  for (const item of recentAlerts) await addDoc(collection(db, 'alerts'), item);
  
  console.log("Inserting Notifications...");
  for (const item of notifications) await addDoc(collection(db, 'notifications'), item);
  
  console.log("Inserting Claims...");
  for (const item of claims) await addDoc(collection(db, 'claims'), item);
  
  console.log("Inserting KPI Cards...");
  for (const item of kpiCards) await addDoc(collection(db, 'kpi_cards'), item);
  
  console.log("Inserting Risk Distribution...");
  for (const item of riskDistribution) await addDoc(collection(db, 'risk_distribution'), item);
  
  console.log("Inserting Anomaly Breakdown...");
  for (const item of anomalyBreakdown) await addDoc(collection(db, 'anomaly_breakdown'), item);
  
  console.log("Inserting Quick Actions...");
  for (const item of quickActions) await addDoc(collection(db, 'quick_actions'), item);

  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

seedData().catch(err => {
  console.error("❌ Error during seeding:", err);
  process.exit(1);
});
