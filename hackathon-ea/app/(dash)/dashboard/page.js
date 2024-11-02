"use client";

import React, { useEffect, useState } from "react";
import Map from "@/components/ui/map.jsx";
import "./dashboard.css";
import WeatherDashboard from "@/components/ui/WeatherDashboard";
import { UserLocation } from "@/app/context/LocationContext";
import "@/app/(dash)/dashboard/dashboard.css";
import { UserAuth } from "@/app/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Leaf, Trophy, Award, Medal } from "lucide-react";
import { db } from "@/utils/firebase";
import EcoChallengesCard from "@/components/ui/eco-challenge-card";

import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function Dashboard() {
  const { coords } = UserLocation();
  const { user } = UserAuth();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setCurrentUser({ ...doc.data(), uid: user.uid });
      }
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <section className="w-full h-screen py-5 px-2 grid dashboard">
      <Map />
      <div className="dashboard-a">
        <WeatherDashboard
          userCoords={{ lat: coords.latitude, lon: coords.longitude }}
        />
      </div>
      <div className="dashboard-b m-1">
        <EcoChallengesCard currentUser={currentUser} />
      </div>
    </section>
  );
}

export default Dashboard;
