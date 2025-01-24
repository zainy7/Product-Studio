require("dotenv").config({ path: ".env.local" });
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

const db = admin.firestore();

async function setupFirebase() {
  try {
    // Create Users collection
    await db.collection("users").doc("dummy").set({
      email: "dummy@example.com",
      name: "Dummy User",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Users collection created");

    // Create Projects collection
    await db
      .collection("projects")
      .doc("dummy")
      .set({
        userId: "dummy",
        productIdea: "Dummy product idea",
        conceptOverview: "Dummy concept overview",
        revisedIdea: "Dummy revised idea",
        featureRequirements: [
          {
            feature: "Dummy feature",
            description: "Dummy description",
            approved: false,
          },
        ],
        generatedCode: "Dummy generated code",
        status: "research",
        deploymentStatus: "not started",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log("Projects collection created");

    // Create Research collection
    await db.collection("research").doc("dummy").set({
      projectId: "dummy",
      question: "Dummy research question",
      hypothesis: "Dummy hypothesis",
      evidence: "Dummy evidence",
      validationStatus: "unvalidated",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("Research collection created");

    // Create indexes
    await db.collection("projects").doc("dummy").delete();
    await db.collection("research").doc("dummy").delete();
    await db.collection("users").doc("dummy").delete();

    await db.collection("projects").orderBy("createdAt").get();
    await db
      .collection("projects")
      .where("userId", "==", "dummy")
      .orderBy("createdAt")
      .get();
    await db
      .collection("research")
      .where("projectId", "==", "dummy")
      .orderBy("createdAt")
      .get();

    console.log("Indexes created");

    console.log("Firebase setup completed successfully");
  } catch (error) {
    console.error("Error setting up Firebase:", error);
  } finally {
    admin.app().delete();
  }
}

setupFirebase();
