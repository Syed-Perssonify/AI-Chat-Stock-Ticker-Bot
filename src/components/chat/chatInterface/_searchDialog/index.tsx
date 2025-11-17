"use client";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CircleFadingPlus, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chats: any[];
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function SearchDialog({
  open,
  onOpenChange,
  chats,
  onSelectChat,
  onNewChat,
}: SearchDialogProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="p-4 pb-2">
        <CommandInput placeholder="Search chats..." />
        <Button
          onClick={() => {
            onOpenChange(false);
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
        <CommandEmpty>No chats found.</CommandEmpty>
        <CommandGroup heading="Chats">
          {chats.map((chat) => (
            <CommandItem
              key={chat.id}
              onSelect={() => {
                onSelectChat(chat.id);
                onOpenChange(false);
              }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{chat.title}</div>
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
