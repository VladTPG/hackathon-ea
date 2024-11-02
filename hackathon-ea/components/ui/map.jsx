"use client";
import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import "@/app/(dash)/dashboard/dashboard.css";
import { UserLocation } from "@/app/context/LocationContext";
import { UserPosts } from "@/app/context/PostsContext";
import { UserAuth } from "@/app/context/AuthContext";
import {
  query,
  doc,
  onSnapshot,
  querySnapshot,
  collection,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

const Map = () => {
  const { user } = UserAuth();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { coords } = UserLocation();
  const [allPosts, setAllPosts] = useState([]);
  const apiKey = "AIzaSyA5RNYP0T4sVIo5jMkghz7d9ggGKu-QX3I";

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "posts"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let itemsArr = [];

        querySnapshot.forEach((doc) => {
          itemsArr.push({ ...doc.data(), id: doc.id });
        });
        console.log(itemsArr);
        setAllPosts(itemsArr);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Define marker styles based on post type
  const markerStyles = {
    // Issues & Hazards (Red spectrum)
    road_hazard: {
      color: "#FF4D4D",
      icon: "⚠️",
    },
    obstruction: {
      color: "#FF6B6B",
      icon: "🚧",
    },
    vandalism: {
      color: "#FF8787",
      icon: "🏗️",
    },
    litter: {
      color: "#FFA3A3",
      icon: "🗑️",
    },
    noise_complaint: {
      color: "#FFC0C0",
      icon: "📢",
    },
    // Positive Posts (Green spectrum)
    community_event: {
      color: "#40C057",
      icon: "🎉",
    },
    positive_development: {
      color: "#51CF66",
      icon: "📈",
    },
    community_initiative: {
      color: "#69DB7C",
      icon: "🤝",
    },
    business_highlight: {
      color: "#8CE99A",
      icon: "🏪",
    },
    public_praise: {
      color: "#B2F2BB",
      icon: "👏",
    },
  };

  // Function to create custom marker icon
  const createCustomMarker = (postType) => {
    const style = markerStyles[postType] || {
      color: "#808080",
      icon: "📍",
    };

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: style.color,
      fillOpacity: 0.9,
      scale: 12,
      strokeColor: "white",
      strokeWeight: 2,
    };
  };

  // Format the date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Function to get post type label
  const getPostTypeLabel = (value) => {
    const postTypes = [
      { value: "road_hazard", label: "Road Hazard" },
      { value: "obstruction", label: "Obstruction" },
      { value: "vandalism", label: "Vandalism" },
      { value: "litter", label: "Litter" },
      { value: "noise_complaint", label: "Noise Complaint" },
      { value: "community_event", label: "Community Event" },
      { value: "positive_development", label: "Positive Development" },
      { value: "community_initiative", label: "Community Initiative" },
      { value: "business_highlight", label: "Business Highlight" },
      { value: "public_praise", label: "Public Praise" },
    ];
    return postTypes.find((type) => type.value === value)?.label || value;
  };

  // Function to create info window content
  const createInfoWindowContent = (post) => {
    const style = markerStyles[post.postType] || {
      icon: "📍",
      color: "#808080",
    };

    return `
      <div class="p-4 max-w-sm">
        <div class="flex items-center gap-2 mb-3" style="border-bottom: 2px solid ${
          style.color
        }; padding-bottom: 8px;">
          <span style="font-size: 1.5em;">${style.icon}</span>
          <h3 class="font-bold text-lg">${getPostTypeLabel(post.postType)}</h3>
        </div>

        <div class="flex items-center gap-3 mb-3">
          <img
            src="${post.userPhoto || "/default-avatar.png"}"
            alt="${post.userName || "Anonymous"}"
            class="w-10 h-10 rounded-full object-cover"
            onerror="this.src='default-avatar.png';"
          />
          <div>
            <p class="font-medium">${post.userName || "Anonymous"}</p>
            <p class="text-sm text-gray-500">${formatDate(post.createdAt)}</p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3 mb-3">
          <p class="text-gray-700 whitespace-pre-wrap">${post.message}</p>
        </div>

        <div class="text-xs text-gray-500 mt-2">
          <p>📍 ${post.coordinates.latitude}, ${post.coordinates.longitude}</p>
        </div>
      </div>
    `;
  };

  // Function to adjust overlapping markers
  const adjustOverlappingMarkers = (posts, mapInstance) => {
    // Group markers by location
    const locationGroups = {};
    posts.forEach((post) => {
      const key = `${post.coordinates.latitude},${post.coordinates.longitude}`;
      if (!locationGroups[key]) {
        locationGroups[key] = [];
      }
      locationGroups[key].push(post);
    });

    // Calculate offset for overlapping markers
    const newMarkers = [];
    Object.values(locationGroups).forEach((postsAtLocation) => {
      if (postsAtLocation.length === 1) {
        // Single marker at location - no adjustment needed
        const post = postsAtLocation[0];
        newMarkers.push(createMarker(post, mapInstance, { lat: 0, lng: 0 }));
      } else {
        // Multiple markers at location - create spiral pattern
        postsAtLocation.forEach((post, index) => {
          const offset = calculateSpiralOffset(index, postsAtLocation.length);
          newMarkers.push(createMarker(post, mapInstance, offset));
        });
      }
    });

    return newMarkers;
  };

  // Calculate spiral offset for overlapping markers
  const calculateSpiralOffset = (index, total) => {
    if (index === 0) return { lat: 0, lng: 0 };

    // Create a spiral pattern
    const angle = (index * 2 * Math.PI) / Math.max(8, total);
    const radius = 0.0001 * Math.ceil(index / 8); // Approx. 10 meters at equator

    return {
      lat: Math.cos(angle) * radius,
      lng: Math.sin(angle) * radius,
    };
  };

  // Create individual marker
  const createMarker = (post, mapInstance, offset) => {
    const marker = new window.google.maps.Marker({
      position: {
        lat: parseFloat(post.coordinates.latitude) + offset.lat,
        lng: parseFloat(post.coordinates.longitude) + offset.lng,
      },
      map: mapInstance,
      title: getPostTypeLabel(post.postType),
      icon: createCustomMarker(post.postType),
      animation: window.google.maps.Animation.DROP,
      optimized: true,
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: createInfoWindowContent(post),
      maxWidth: 320,
      ariaLabel: post.message,
    });

    marker.addListener("click", () => {
      markers.forEach((m) => m.infoWindow?.close());
      infoWindow.open(mapInstance, marker);
    });

    marker.addListener("mouseover", () => {
      marker.setZIndex(window.google.maps.Marker.MAX_ZINDEX + 1);
      marker.setOptions({
        icon: {
          ...createCustomMarker(post.postType),
          scale: 14, // Slightly larger on hover
        },
      });
    });

    marker.addListener("mouseout", () => {
      marker.setZIndex(undefined);
      marker.setOptions({
        icon: createCustomMarker(post.postType),
      });
    });

    marker.infoWindow = infoWindow;
    return marker;
  };

  // Function to add markers from posts
  const addMarkersFromPosts = (mapInstance) => {
    // Clear existing markers
    markers.forEach((marker) => {
      marker.infoWindow?.close();
      marker.setMap(null);
    });

    // Create new markers with adjusted positions
    const newMarkers = adjustOverlappingMarkers(allPosts, mapInstance);
    setMarkers(newMarkers);
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        const mapDiv = document.getElementById("map");
        if (!mapDiv) {
          throw new Error("Map container not found");
        }

        const mapInstance = new window.google.maps.Map(mapDiv, {
          center: {
            lat: parseFloat(coords.latitude),
            lng: parseFloat(coords.longitude),
          },
          zoom: 12,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        setMap(mapInstance);
        setLoading(false);

        if (allPosts.length > 0) {
          addMarkersFromPosts(mapInstance);
        }
      } catch (err) {
        console.error("Error loading map:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (markers.length) {
        markers.forEach((marker) => {
          marker.infoWindow?.close();
          marker.setMap(null);
        });
      }
    };
  }, []); // Initialize map once

  // Update markers when posts change
  useEffect(() => {
    if (map && allPosts.length > 0) {
      addMarkersFromPosts(map);
    }
  }, [allPosts, map]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">
          Error loading map: {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative dashboard-map`}
      style={{ width: `100%`, height: `100%` }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      <div
        id="map"
        className="w-full h-full rounded-2xl shadow-lg"
        style={{ visibility: loading ? "hidden" : "visible" }}
      />
    </div>
  );
};

export default Map;
