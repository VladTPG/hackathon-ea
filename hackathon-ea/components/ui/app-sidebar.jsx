import { Newspaper, Home, Leaf, LogOut, Settings } from "lucide-react";
import "@/app/globals.css";
import { UserAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Menu items.
const items = [
  {
    title: "UrbanDash",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Feed",
    url: "/feed",
    icon: Newspaper,
  },
  {
    title: "Eco-Challenge",
    url: "/eco-challenge",
    icon: Leaf,
  },
];

export default function AppSidebar() {
  const { user, logOut } = UserAuth();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <Sidebar>
      <SidebarContent className="text-white bg-gradient-to-tr from-green-400 to-purple-500">
        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="text-white text-md font-bold">
            {user ? `Welcome, ${user.displayName}` : "Welcome"}
          </SidebarGroupLabel>
          <Separator className="bg-white my-3" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem className="flex justify-center ">
                <SidebarMenuButton
                  onClick={handleLogOut}
                  className="hover:bg-red-400 hover:text-white transition-all "
                >
                  <LogOut></LogOut>
                  Log out
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
