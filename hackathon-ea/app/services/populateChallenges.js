import { db } from "@/utils/firebase";
import { addDoc, collection } from "firebase/firestore";

async function addChallenge(name, description, points, address, imageUrl) {
  try {
    await addDoc(collection(db, "challenges"), {
      name,
      description,
      points,
      address,
      imageUrl,
    });
    console.log(`Challenge "${name}" added successfully!`);
  } catch (e) {
    console.error("Error adding challenge: ", e);
  }
}

export function addChallenges() {
  // Challenges with Bucharest addresses and real image URLs
  addChallenge(
    "Bike to Work",
    "Use a bike instead of a car for one day.",
    20,
    "Strada Lipscani, Bucharest",
    "https://images.unsplash.com/photo-1504567961542-e24d9439a724"
  );

  addChallenge(
    "Recycle Plastic",
    "Recycle at least 5 plastic items.",
    15,
    "Calea Victoriei, Bucharest",
    "https://images.unsplash.com/photo-1562278249-1c5c3aaef1ae"
  );

  addChallenge(
    "Plant a Tree",
    "Plant a tree in your community or garden.",
    30,
    "Herastrau Park, Bucharest",
    "https://images.unsplash.com/photo-1601906440231-7090c9ce246d"
  );

  addChallenge(
    "Use Reusable Bag",
    "Use a reusable bag for grocery shopping.",
    10,
    "Strada Baneasa, Bucharest",
    "https://images.unsplash.com/photo-1564869730604-7471d4bcbfe9"
  );

  addChallenge(
    "Reduce Water Use",
    "Take a shorter shower or turn off the tap while brushing.",
    15,
    "Strada Aviatorilor, Bucharest",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
  );

  addChallenge(
    "Pick Up Litter",
    "Collect and dispose of litter in your area.",
    20,
    "Cismigiu Park, Bucharest",
    "https://images.unsplash.com/photo-1522199710521-72d69614c702"
  );

  addChallenge(
    "Unplug Electronics",
    "Unplug all unused electronics for the day.",
    10,
    "Strada Universitatii, Bucharest",
    "https://images.unsplash.com/photo-1518972559570-1ec7c6e35d74"
  );

  addChallenge(
    "Use Public Transport",
    "Use public transport instead of a car for one day.",
    25,
    "Piata Unirii, Bucharest",
    "https://images.unsplash.com/photo-1586125574400-4e00840d0e3b"
  );

  addChallenge(
    "Avoid Plastic Bottles",
    "Use a reusable bottle instead of buying plastic ones.",
    15,
    "Strada Mosilor, Bucharest",
    "https://images.unsplash.com/photo-1526403224979-c5b1aa7abf55"
  );

  addChallenge(
    "Start Composting",
    "Begin composting food scraps at home.",
    25,
    "Strada Vitan, Bucharest",
    "https://images.unsplash.com/photo-1608138408917-8dc5e0b7ed28"
  );
}
