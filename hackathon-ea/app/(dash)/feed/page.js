"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAuth } from "@/app/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, AlertTriangle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { db } from "@/utils/firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { UserLocation } from "@/app/context/LocationContext";
import { UserPosts } from "@/app/context/PostsContext";

const Feed = () => {
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState("");
  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { user } = UserAuth();
  const { coords } = UserLocation();
  const observer = useRef();
  const { setAllPosts } = UserPosts();

  // Enhanced post types with icons and categories
  const postTypes = [
    {
      category: "Issues",
      items: [
        {
          value: "road_hazard",
          label: "Road Hazard",
          icon: AlertTriangle,
          color: "text-red-500",
        },
        {
          value: "obstruction",
          label: "Obstruction",
          icon: AlertTriangle,
          color: "text-orange-500",
        },
        {
          value: "vandalism",
          label: "Vandalism",
          icon: AlertTriangle,
          color: "text-red-600",
        },
        {
          value: "litter",
          label: "Litter",
          icon: AlertTriangle,
          color: "text-yellow-500",
        },
        {
          value: "noise_complaint",
          label: "Noise Complaint",
          icon: AlertTriangle,
          color: "text-purple-500",
        },
      ],
    },
    {
      category: "Community",
      items: [
        {
          value: "community_event",
          label: "Community Event",
          icon: Heart,
          color: "text-green-500",
        },
        {
          value: "positive_development",
          label: "Positive Development",
          icon: Heart,
          color: "text-blue-500",
        },
        {
          value: "community_initiative",
          label: "Community Initiative",
          icon: Heart,
          color: "text-indigo-500",
        },
        {
          value: "business_highlight",
          label: "Business Highlight",
          icon: Heart,
          color: "text-pink-500",
        },
        {
          value: "public_praise",
          label: "Public Praise",
          icon: Heart,
          color: "text-teal-500",
        },
      ],
    },
  ];

  // Rest of your existing functions remain the same
  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  // Keep all your existing functions unchanged...
  const retrievePosts = useCallback(() => {
    if (user) {
      setIsLoading(true);
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastVisible);

        let itemsArr = [];
        snapshot.forEach((doc) => {
          itemsArr.push({ ...doc.data(), id: doc.id });
        });

        setPosts(itemsArr);
        setAllPosts(itemsArr);
        setHasMore(itemsArr.length === 10);
        setIsLoading(false);
      });

      return unsubscribe;
    }
  }, [user, setAllPosts]);

  const loadMorePosts = async () => {
    if (!lastVisible || isLoading || !hasMore) return;

    setIsLoading(true);
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(10)
    );

    const documentSnapshots = await getDocs(q);
    const newLastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastVisible(newLastVisible);

    let newPosts = [];
    documentSnapshots.forEach((doc) => {
      newPosts.push({ ...doc.data(), id: doc.id });
    });

    setPosts((prev) => [...prev, ...newPosts]);
    setHasMore(newPosts.length === 10);
    setIsLoading(false);
  };

  const addPost = async (e) => {
    e.preventDefault();

    if (!message || !postType) {
      alert("Please fill out both fields.");
      return;
    }

    const post = {
      postType,
      message,
      userFk: user.uid,
      userName: user.displayName,
      userPhoto: user.photoURL,
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      createdAt: new Date().toISOString(),
    };

    setMessage("");
    setPostType("");

    await addDoc(collection(db, "posts"), post);
  };

  useEffect(() => {
    const unsubscribe = retrievePosts();
    return () => unsubscribe && unsubscribe();
  }, [retrievePosts]);

  const deletePost = async (id) => {
    try {
      const postRef = doc(db, "posts", id);
      await deleteDoc(postRef);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col py-10 items-center">
      <Card className="lg:w-[40%] mb-4 shadow-xl hover:shadow-2xl transition-all">
        <CardHeader className="flex flex-row items-center gap-2">
          {user && (
            <Avatar className="">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>
          )}
          <Input
            className="w-full"
            placeholder="What is happening...?"
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {postType
                  ? postTypes
                      .flatMap((cat) => cat.items)
                      .find((post) => post.value === postType)?.label
                  : "Select post type..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search post types..." />
                <CommandList>
                  <CommandEmpty>No post type found.</CommandEmpty>
                  {postTypes.map((category) => (
                    <CommandGroup
                      key={category.category}
                      heading={category.category}
                    >
                      {category.items.map((post) => (
                        <CommandItem
                          key={post.value}
                          onSelect={() => {
                            setPostType(post.value);
                            setOpen(false);
                          }}
                          className="flex items-center"
                        >
                          <post.icon
                            className={cn("mr-2 h-4 w-4", post.color)}
                          />
                          <span>{post.label}</span>
                          {postType === post.value && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>{" "}
                {/* Add this closing tag */}
              </Command>
            </PopoverContent>
          </Popover>
          <Button variant="secondary" onClick={addPost}>
            Post report
          </Button>
        </CardFooter>
      </Card>

      <div className="lg:w-[40%] flex flex-col gap-5">
        {posts.map((post, index) => {
          const postTypeInfo = postTypes
            .flatMap((cat) => cat.items)
            .find((type) => type.value === post.postType);

          if (posts.length === index + 1) {
            return (
              <Card
                ref={lastPostElementRef}
                className="p-4 shadow-lg"
                key={post.id}
              >
                <div className="flex gap-2">
                  <Avatar className="">
                    <AvatarImage src={post.userPhoto} />
                    <AvatarFallback>{post.userName[0]}</AvatarFallback>
                  </Avatar>
                  <CardContent className="p-0">
                    <p className="font-semibold text-xl">{post.message}</p>
                    <span
                      className={cn(
                        "text-sm",
                        postTypeInfo?.color || "text-gray-400"
                      )}
                    >
                      {postTypeInfo?.label || "Unknown Type"}{" "}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </CardContent>
                </div>
                {post.userFk === user?.uid && (
                  <CardFooter className="justify-end p-0">
                    <Button
                      variant="destructive"
                      onClick={() => deletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          } else {
            return (
              <Card className="p-4 shadow-lg" key={post.id}>
                <div className="flex gap-2">
                  <Avatar className="">
                    <AvatarImage src={post.userPhoto} />
                    <AvatarFallback>{post.userName[0]}</AvatarFallback>
                  </Avatar>
                  <CardContent className="p-0">
                    <p className="font-semibold text-xl">{post.message}</p>
                    <p className="text-xs text-gray-500">
                      by {user?.uid === post.userFk ? "You" : post.userName}
                    </p>
                    <span
                      className={cn(
                        "text-sm",
                        postTypeInfo?.color || "text-gray-400"
                      )}
                    >
                      {postTypeInfo?.label || "Unknown Type"}{" "}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </CardContent>
                </div>
                {post.userFk === user?.uid && (
                  <CardFooter className="justify-end p-0">
                    <Button
                      variant="destructive"
                      onClick={() => deletePost(post.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          }
        })}
        {isLoading && (
          <div className="text-center py-4">Loading more posts...</div>
        )}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-4">No more posts to load</div>
        )}
      </div>
    </div>
  );
};

export default Feed;
