"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Settings } from "lucide-react";
import { MobileSidebar } from "../_mobileSidebar";
import { SettingsPanel } from "@/components/chat/SettingsPanel";

interface MobileHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSearchOpen: () => void;
  chats: any[];
  currentChatId: string | null;
  deleteChat: (chatId: string) => void;
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export function MobileHeader({
  sidebarOpen,
  setSidebarOpen,
  settingsOpen,
  setSettingsOpen,
  onNewChat,
  onSelectChat,
  onSearchOpen,
  chats,
  currentChatId,
  deleteChat,
  settings,
  onSettingsChange,
}: MobileHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background border-b">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[85vw] sm:w-[380px]">
          <SheetTitle className="sr-only">Chat History </SheetTitle>
          <MobileSidebar
            onNewChat={() => {
              setSidebarOpen(false);
              onNewChat();
            }}
            onSearchOpen={() => {
              setSidebarOpen(false);
              onSearchOpen();
            }}
            chats={chats}
            currentChatId={currentChatId}
            onSelect={onSelectChat}
            onCreate={onNewChat}
            onDelete={deleteChat}
          />
        </SheetContent>
      </Sheet>

      <h1 className="text-base font-semibold truncate">DropAnalysis</h1>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="p-0 w-[85vw] sm:w-[380px] [&>button]:hidden"
        >
          <SheetTitle className="sr-only">Settings</SheetTitle>
          <div className="h-full flex flex-col">
            <SettingsPanel
              settings={settings}
              onChange={onSettingsChange}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
