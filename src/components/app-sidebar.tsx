import {
  Bot,
  Users,
  Megaphone,
  BarChart3,
  Mic,
  AudioLines,
  FileAudio,
  Phone,
  MessageSquare,
  Settings,
  LifeBuoy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuGroups = [
  {
    label: "AI Call Agent",
    items: [
      { title: "Agents", icon: Bot, href: "/agents" },
      { title: "Customer List", icon: Users, href: "#" },
      { title: "Campaigns", icon: Megaphone, href: "#" },
      { title: "Analytics", icon: BarChart3, href: "#" },
      { title: "Recordings", icon: Mic, href: "#" },
    ],
  },
  {
    label: "Text to Speech",
    items: [{ title: "Generate Speech", icon: AudioLines, href: "#" }],
  },
  {
    label: "Transcription (ASR)",
    items: [{ title: "Transcribe Audio", icon: FileAudio, href: "#" }],
  },
  {
    label: "WhatsApp Marketing",
    items: [
      { title: "Connected Numbers", icon: Phone, href: "#" },
      { title: "WhatsApp Campaigns", icon: MessageSquare, href: "#" },
    ],
  },
];

const footerItems = [
  { title: "Settings", icon: Settings, href: "#" },
  { title: "Support", icon: LifeBuoy, href: "#" },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
