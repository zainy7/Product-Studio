import { NextApiRequest, NextApiResponse } from "next";
import { auth, db } from "../../lib/firebase-admin";
import { setDoc, doc } from "firebase/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { productIdea } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const projectRef = doc(db, "projects", userId);
    await setDoc(
      projectRef,
      {
        userId,
        productIdea,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "research",
      },
      { merge: true },
    );

    res.status(200).json({ message: "Product idea saved successfully" });
  } catch (error) {
    console.error("Error saving product idea:", error);
    res
      .status(500)
      .json({ message: "Error saving product idea", error: error.message });
  }
}
