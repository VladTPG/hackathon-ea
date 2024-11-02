import { createContext, useContext, useState } from "react";

const PostsContext = createContext();

export const PostsContextProvider = ({ children }) => {
  const [allPosts, setAllPosts] = useState([]);

  // Create the value object
  const value = {
    allPosts,
    setAllPosts,
  };

  return (
    <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
  );
};

// Custom hook for using the posts context
export const UserPosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("UserPosts must be used within a PostsContextProvider");
  }
  return context;
};
