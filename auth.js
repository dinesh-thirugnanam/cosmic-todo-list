import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import connectToDatabase from "./lib/mongodb";
import User from "./models/User";
import Node from "./models/Node";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      try {
        // Connect to MongoDB
        await connectToDatabase();

        const email = user.email?.toLowerCase();
        if (!email) {
          throw new Error("No email provided by Google OAuth");
        }

        // Check if user exists
        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          // Create new user
          dbUser = await User.create({
            email,
            createdAt: new Date(),
          });

          // Create three default nodes
          const defaultNodes = [
            { listName: "Personal", email, isDefault: true },
            { listName: "Work", email, isDefault: true },
            { listName: "My Day", email, isDefault: true },
          ];

          await Node.insertMany(defaultNodes);
        }

        return true; // Allow sign-in
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Deny sign-in if there's an error
      }
    },
  },
});