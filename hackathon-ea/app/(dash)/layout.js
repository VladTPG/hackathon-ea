"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/ui/app-sidebar";
import { AuthContextProvider } from "../context/AuthContext";
import { LocationContextProvider } from "../context/LocationContext";
import { PostsContextProvider } from "../context/PostsContext";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <html>
      <body className="">
        <AuthContextProvider>
          <PostsContextProvider>
            <LocationContextProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                {children}
              </SidebarProvider>
            </LocationContextProvider>
          </PostsContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
