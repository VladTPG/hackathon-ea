"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, Trophy, Star, Medal } from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";

const EcoChallengesCard = ({ currentUser }) => {
  const [challengeStats, setChallengeStats] = useState({
    totalChallenges: 0,
    completed: 0,
    lifetimePoints: 0,
    recentCompletions: [],
  });

  useEffect(() => {
    if (!currentUser) return;

    const fetchChallengeStats = async () => {
      try {
        // Get all challenges to determine total available
        const challengesRef = collection(db, "challenges");
        const challengesSnapshot = await getDocs(challengesRef);
        const totalChallenges = challengesSnapshot.size;

        // Get details of completed challenges
        const completedChallenges = await Promise.all(
          currentUser.attendedEvents.map(async (challengeId) => {
            const challengeDoc = challengesSnapshot.docs.find(
              (doc) => doc.id === challengeId
            );
            return challengeDoc
              ? {
                  name: challengeDoc.data().name,
                  completedAt: challengeDoc.data().date, // Assuming challenges have a date field
                }
              : null;
          })
        );

        // Filter out any null values and sort by date
        const validCompletions = completedChallenges
          .filter(Boolean)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
          .slice(0, 3); // Get only the 3 most recent

        setChallengeStats({
          totalChallenges,
          completed: currentUser.attendedEvents.length,
          lifetimePoints: currentUser.lifetimePoints,
          recentCompletions: validCompletions,
        });
      } catch (error) {
        console.error("Error fetching challenge stats:", error);
      }
    };

    fetchChallengeStats();
  }, [currentUser]);

  const completionPercentage =
    Math.round(
      (challengeStats.completed / challengeStats.totalChallenges) * 100
    ) || 0;

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Your Eco Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Challenges Completed</span>
              <span className="text-sm text-gray-500">
                {challengeStats.completed} / {challengeStats.totalChallenges}
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Completed
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {challengeStats.completed}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">
                  Lifetime Points
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {challengeStats.lifetimePoints}
              </p>
            </div>
          </div>

          {/* Recent Completions */}
          {challengeStats.recentCompletions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Medal className="h-4 w-4 text-yellow-500" />
                Recent Completions
              </h3>
              <div className="space-y-2">
                {challengeStats.recentCompletions.map((completion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <span className="text-sm">{completion.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EcoChallengesCard;
