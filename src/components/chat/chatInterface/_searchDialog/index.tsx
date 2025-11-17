"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { CircleFadingPlus, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chats: any[];
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

// Helper function to highlight matching text
function HighlightText({
  text,
  searchQuery,
  className,
}: {
  text: string;
  searchQuery: string;
  className?: string;
}) {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(
    `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground rounded px-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function SearchDialog({
  open,
  onOpenChange,
  chats,
  onSelectChat,
  onNewChat,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats in real-time based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLowerCase();
    return chats.filter((chat) => {
      const title = chat.title?.toLowerCase() || "";
      return title.includes(query);
    });
  }, [chats, searchQuery]);

  // Reset search when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery("");
    }
    onOpenChange(isOpen);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      shouldFilter={false}
    >
      <DialogTitle className="sr-only">Search chats</DialogTitle>
      <div className="p-4 pb-2">
        <CommandInput
          placeholder="Search chats..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <Button
          onClick={() => {
            handleOpenChange(false);
            onNewChat();
          }}
          className="w-full gap-2 justify-start mt-3"
          variant="outline"
        >
          <CircleFadingPlus className="h-4 w-4 shrink-0" />
          <span>New chat</span>
        </Button>
      </div>
      <CommandList>
        <CommandEmpty>
          {searchQuery.trim()
            ? `No chats found matching "${searchQuery}"`
            : "No chats found."}
        </CommandEmpty>
        <CommandGroup heading="Chats">
          {filteredChats.map((chat) => (
            <CommandItem
              key={chat.id}
              value={chat.title}
              onSelect={() => {
                onSelectChat(chat.id);
                handleOpenChange(false);
              }}
              className="flex items-center gap-2 cursor-pointer dark:[&:hover>*]:text-white dark:[&:hover_*]:text-white"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  <HighlightText text={chat.title} searchQuery={searchQuery} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(chat.updatedAt, "MMM d, HH:mm")}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
