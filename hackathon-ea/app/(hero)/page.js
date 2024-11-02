"use client";
import Image from "next/image";
import Link from "next/link";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function Home() {
  const { user, googleSignIn } = UserAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      const createUserDoc = async () => {
        try {
          // Create reference to user document
          const userRef = doc(db, "users", user.uid);
          // Check if user exists
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // Create new user document with setDoc instead of addDoc
            const newUser = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoUrl: user.photoURL, // Fixed property name
              lifetimePoints: 0,
              points: 0,
              claimedRewards: [],
              attendedEvents: [],
              createdAt: new Date().toISOString(),
            };

            // Use setDoc to create document with specific ID
            await setDoc(userRef, newUser);
            console.log("New user created:", user.uid);
          } else {
            console.log("User already exists:", user.uid);
          }

          // Navigate to dashboard after user check/creation
          router.push("/dashboard");
        } catch (error) {
          console.error("Error creating user document:", error);
        }
      };

      createUserDoc();
    }
  }, [user, router]);

  return (
    <div className="h-screen overflow-hidden">
      <section className="pt-24 bg-slate">
        <div className="px-12 mx-auto max-w-7xl">
          <div className="w-full mx-auto text-left md:w-11/12 xl:w-9/12 md:text-center">
            <h1 className="mb-8 text-4xl font-extrabold leading-none tracking-normal text-white md:text-6xl md:tracking-tight">
              <span>Unlock </span>{" "}
              <span className="block w-full py-2 text-transparent bg-clip-text leading-12 bg-gradient-to-r from-green-400 to-purple-500 lg:inline">
                Your City
              </span>{" "}
              <span>with UrbanDash</span>
            </h1>
            <p className="px-0 mb-8 text-lg text-gray-300 md:text-xl lg:px-24">
              Get real-time updates on city services, news, and events—all in
              one place. Stay connected and informed, wherever you are.
            </p>
            <div className="mb-4 space-x-0 md:space-x-2 md:mb-8">
              <div
                onClick={handleGoogleSignIn}
                className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-green-400 rounded-2xl sm:w-auto sm:mb-0 cursor-pointer"
              >
                Go to UrbanDash
                <svg
                  className="w-4 h-4 ml-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full mx-auto mt-20 text-center md:w-10/12">
            <div className="relative z-0 w-full mt-8">
              <div className="relative overflow-hidden shadow-2xl">
                <div className="flex items-center flex-none px-4 bg-gradient-to-bl from-green-400 to-purple-500 rounded-b-none h-11 rounded-xl">
                  <div className="flex space-x-1.5">
                    <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                    <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                    <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                  </div>
                </div>
                <img src="/mockup.png" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
