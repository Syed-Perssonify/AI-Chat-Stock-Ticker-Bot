"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  CircleFadingPlus,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  onNewChat: () => void;
  onSearchOpen: () => void;
}

export function SidebarHeader({ onNewChat, onSearchOpen }: SidebarHeaderProps) {
  const sidebar = useSidebar();

  return (
    <div className="p-4 border-b group-data-[collapsible=icon]:p-2">
      {/* Expanded layout */}
      <div className="group-data-[collapsible=icon]:hidden">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Drop Analysis</h2>
            <SidebarTrigger className="h-8 w-8 shrink-0">
              <PanelLeftClose className="h-4 w-4" />
            </SidebarTrigger>
          </div>
          <p className="text-xs text-muted-foreground">Chat History</p>
        </div>
        <div className="space-y-1">
          <Button
            onClick={onNewChat}
            variant="ghost"
            className="w-full gap-2 justify-start h-auto py-2 px-3 font-normal"
          >
            <CircleFadingPlus className="h-4 w-4 shrink-0" />
            <span>New chat</span>
          </Button>
          <Button
            onClick={onSearchOpen}
            variant="ghost"
            className="w-full gap-2 justify-start h-auto py-2 px-3 font-normal"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search chats</span>
          </Button>
        </div>
      </div>

      {/* Collapsed layout - all icons in a single vertical column */}
      <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="h-9 w-9 shrink-0">
                <PanelLeft className="h-4 w-4" />
              </SidebarTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewChat}
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
              >
                <CircleFadingPlus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSearchOpen}
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Search chats</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  // Toggle sidebar to show messages/chat history
                  sidebar.setOpen(true);
                }}
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>View messages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
