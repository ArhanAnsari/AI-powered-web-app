/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Use bcryptjs for better compatibility in various environments

// Mocked list of users (In production, replace this with your DB logic)
const users = [
  {
    id: 1, // user ID as a number
    name: "John Doe",
    email: "johndoe@gmail.com",
    password: "$2a$10$1234567890123456789012" // This should be the hashed password
  }
];

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "johndoe@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Ensure credentials exist before proceeding
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find the user by email
        const user = users.find(user => user.email === credentials.email);

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          // Convert the user object to match the expected structure by NextAuth
          return {
            id: String(user.id),  // Convert id from number to string
            name: user.name,
            email: user.email
          };
        } else {
          // If user is not found or password doesn't match, return null
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      session.user = token;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error' // Error page if sign-in fails
  }
});
