// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Node from "@/models/Node";

// Helper function to create default nodes for new users
async function createDefaultNodes(uid) {
  const defaultNodes = [
    { listName: "Inbox", isDefault: true, uid, tasks: [] },
    { listName: "Today", isDefault: true, uid, tasks: [] },
    { listName: "Upcoming", isDefault: true, uid, tasks: [] },
  ];

  await Node.insertMany(defaultNodes);
}

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email || !user.id) return false;

        await dbConnect();

        // Check if user exists in the User collection
        let customUser = await User.findOne({ email: user.email });

        // Create user and default nodes if they don't exist
        if (!customUser) {
          customUser = await User.create({
            email: user.email,
            uid: user.id,
          });

          await createDefaultNodes(user.id);
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id; // Add user ID to session
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
