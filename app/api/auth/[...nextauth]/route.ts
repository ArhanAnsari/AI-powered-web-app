import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { adminDb } from "@/firebaseAdmin"; // Import Firestore Admin instance

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter(adminDb), // Use the Firebase Admin Firestore instance
  callbacks: {
    async signIn({ user }) {
      const userEmail = user.email;

      if (!userEmail) {
        console.error("No email found for user");
        return false; // Block sign-in if no email
      }

      // Reference to the user's document in Firestore
      const userDocRef = adminDb.collection("users").doc(userEmail);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        // User already exists, fetch plan and request count
        const userData = userDoc.data();
        console.log("User Plan:", userData?.plan);
        console.log("Request Count:", userData?.requestCount);
      } else {
        // New user, create a default entry in Firestore
        const newUser = {
          plan: "free", // Default plan
          requestCount: 0, // Default request count
        };
        await userDocRef.set(newUser);
        console.log("New user created with Free plan and 0 request count.");
      }

      return true; // Allow sign-in
    },
    async session({ session }) {
      // Pass session information
      return session;
    },
  },
};

// Create the NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler for POST and GET requests
export { handler as GET, handler as POST };
