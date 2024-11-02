"use client";
import { useState, useEffect } from "react";
import Challenge from "@/app/(dash)/eco-challenge/challenge";
import { UserAuth } from "@/app/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  querySnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/utils/firebase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Updated to use lifetimePoints
const getUserRank = (lifetimePoints) => {
  if (lifetimePoints >= 501) {
    return {
      title: "City Hero",
      color: "text-purple-600",
      nextRank: null,
      pointsToNext: null,
      rewards: [
        {
          title: "Free Public Transport",
          description: "Get a month of free public transport in the city",
          points: 600,
        },
        {
          title: "Plant a Tree",
          description: "Plant a tree in your name in the city park",
          points: 550,
        },
      ],
    };
  } else if (lifetimePoints >= 201) {
    return {
      title: "Green Warrior",
      color: "text-green-600",
      nextRank: "City Hero",
      pointsToNext: 501 - lifetimePoints,
      rewards: [
        {
          title: "Eco-friendly Water Bottle",
          description: "Receive a reusable water bottle",
          points: 300,
        },
        {
          title: "Local Market Voucher",
          description: "Get a $20 voucher for the local farmers market",
          points: 400,
        },
      ],
    };
  } else {
    return {
      title: "Eco Beginner",
      color: "text-blue-600",
      nextRank: "Green Warrior",
      pointsToNext: 201 - lifetimePoints,
      rewards: [
        {
          title: "Eco Badge",
          description: "Digital badge for your profile",
          points: 100,
        },
        {
          title: "Recycling Kit",
          description: "Basic home recycling kit",
          points: 150,
        },
      ],
    };
  }
};

function EcoChallenge() {
  const { user } = UserAuth();
  const [ecoUser, setEcoUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setEcoUser(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );
    const q = query(collection(db, "challenges"));
    const unsub = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setChallenges(itemsArr);
    });
    return () => {
      unsubscribe();
      unsub();
    };
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Get user's rank based on lifetimePoints
  const userRank = getUserRank(ecoUser?.lifetimePoints || 0);

  return (
    <div className="m-5 w-full relative">
      {user && (
        <Card className="mx-32 my-6">
          <CardHeader>
            <div className="flex gap-2 items-center">
              <Avatar>
                <AvatarImage src={ecoUser?.photoUrl} />
                <AvatarFallback>{ecoUser?.displayName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <CardTitle>{ecoUser?.displayName}</CardTitle>
                <div className="flex flex-col">
                  <p className={`text-sm font-semibold ${userRank.color}`}>
                    {userRank.title}
                  </p>
                  {userRank.nextRank && (
                    <p className="text-xs text-gray-500">
                      {userRank.pointsToNext} points to {userRank.nextRank}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-md font-extrabold text-gray-700">
                  Current Points
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {ecoUser?.points || 0}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <h1 className="text-center mb-8 text-4xl font-extrabold leading-none tracking-normal text-black md:text-6xl md:tracking-tight">
        <span>Earn </span>{" "}
        <span className="block w-full py-2 text-transparent bg-clip-text leading-12 bg-gradient-to-r from-green-400 to-purple-500 lg:inline">
          EcoPoints
        </span>{" "}
        <span>by participating in events</span>
      </h1>

      <div className="flex flex-wrap gap-5 p-5 justify-center">
        {challenges.map((challenge) => (
          <Challenge
            key={challenge.id}
            challenge={challenge}
            ecoUser={ecoUser}
          />
        ))}
      </div>

      <Popover>
        <PopoverTrigger className="fixed bottom-4 right-4 z-10 font-bold bg-gradient-to-tr from-green-400 to-purple-500 shadow-2xl hover:bg-green-500 text-white py-2 px-4 rounded-md transition-all">
          View rewards
        </PopoverTrigger>
        <PopoverContent className="mr-4 mb-4 w-[30rem]">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-center">
                Rewards & Ranks
              </h1>
              <p className="text-center text-sm text-gray-500 mt-1">
                Unlock exclusive rewards as you rank up
              </p>
            </div>

            <div className="space-y-6">
              {/* Eco Beginner Section */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-blue-600">
                    Eco Beginner
                  </h2>
                  <span className="text-sm text-gray-500">(0-200 points)</span>
                </div>
                <div className="mt-2 space-y-3">
                  {getUserRank(0).rewards.map((reward, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reward.title}</h3>
                          <p className="text-sm text-gray-600">
                            {reward.description}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-blue-600">
                          {reward.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Green Warrior Section */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-green-600">
                    Green Warrior
                  </h2>
                  <span className="text-sm text-gray-500">
                    (201-500 points)
                  </span>
                </div>
                <div className="mt-2 space-y-3">
                  {getUserRank(201).rewards.map((reward, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reward.title}</h3>
                          <p className="text-sm text-gray-600">
                            {reward.description}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {reward.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* City Hero Section */}
              <div className="pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-purple-600">
                    City Hero
                  </h2>
                  <span className="text-sm text-gray-500">(501+ points)</span>
                </div>
                <div className="mt-2 space-y-3">
                  {getUserRank(501).rewards.map((reward, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{reward.title}</h3>
                          <p className="text-sm text-gray-600">
                            {reward.description}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-purple-600">
                          {reward.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Progress Section */}
              <div className="pt-4 border-t">
                <p className="text-center font-semibold">Your Progress</p>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Current Points: {ecoUser?.points || 0}</span>
                  <span>Lifetime Points: {ecoUser?.lifetimePoints || 0}</span>
                </div>
                {userRank.nextRank && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${userRank.color.replace(
                          "text-",
                          "bg-"
                        )}`}
                        style={{
                          width: `${Math.min(
                            100,
                            ((ecoUser?.lifetimePoints || 0) /
                              (userRank.pointsToNext +
                                (ecoUser?.lifetimePoints || 0))) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">
                      {userRank.pointsToNext} points to {userRank.nextRank}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default EcoChallenge;
