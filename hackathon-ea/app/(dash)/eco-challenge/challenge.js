import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { UserAuth } from "@/app/context/AuthContext";

function Challenge({ challenge, ecoUser }) {
  const { name, description, imageUrl, points, address, id } = challenge;
  const [isLoading, setIsLoading] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const { user } = UserAuth();

  // Move the attendance check to useEffect
  useEffect(() => {
    if (ecoUser?.attendedEvents) {
      setIsAttending(ecoUser.attendedEvents.includes(id));
    }
  }, [ecoUser, id]);

  const handleActivityParticipation = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error("User document not found");
        return;
      }

      const userData = userSnap.data();

      if (userData.attendedEvents?.includes(id)) {
        console.log("User already participated in this activity");
        return;
      }

      const newAttendedEvents = [...(userData.attendedEvents || []), id];
      const newPoints = (userData.points || 0) + points;
      const newLifetimePoints = (userData.lifetimePoints || 0) + points;

      await updateDoc(userRef, {
        attendedEvents: newAttendedEvents,
        points: newPoints,
        lifetimePoints: newLifetimePoints,
      });

      setIsAttending(true);
    } catch (error) {
      console.error("Error updating activity participation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden w-fit h-fit">
      <CardHeader
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          height: "10rem",
        }}
      ></CardHeader>
      <CardContent className="flex gap-2 flex-col mt-5">
        <CardTitle>
          {name} - {points} ECOPOINTS
        </CardTitle>
        <CardDescription className="w-[18rem] min-h-16">
          <span className="block text-gray-400">{address}</span>
          <span>{description}</span>
        </CardDescription>
        <Button
          className={`font-bold ${
            isAttending ? "bg-gray-400" : "bg-green-600 hover:bg-green-500"
          }`}
          onClick={handleActivityParticipation}
          disabled={isLoading || isAttending}
        >
          {isLoading ? "Processing..." : isAttending ? "Completed" : "Done"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default Challenge;
