"use client";

import { useState } from "react";
import { Chat } from "@/types/chat";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Trash2, CircleFadingPlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onDelete: (chatId: string) => void;
}

export function ChatHistory({
  chats,
  currentChatId,
  onSelect,
  onCreate,
  onDelete,
}: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto group-data-[collapsible=icon]:overflow-hidden">
        <div className="p-2 group-data-[collapsible=icon]:p-0">
          {chats.length === 0 ? (
            <div className="text-center py-6 sm:py-8 px-4 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
              <CircleFadingPlus className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Your chat list is empty</p>
              <p className="text-xs mt-1">
                Click "New Chat" to begin your first conversation!
              </p>
            </div>
          ) : (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="group-data-[collapsible=icon]:hidden"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    !isOpen && "rotate-180"
                  )}
                />
                <span className="font-medium">Chats</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {chats.length}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1">
                <div className="space-y-0.5">
                  {chats.map((chat, index) => {
                    // Fade the last few items to match the image
                    const isFaded = index >= chats.length - 2;
                    return (
                      <div
                        key={chat.id}
                        className={cn(
                          "group/chat relative px-2 py-2 cursor-pointer transition-colors rounded-md",
                          "hover:bg-gray-50",
                          currentChatId === chat.id && "bg-muted/30",
                          isFaded && "opacity-60"
                        )}
                        onClick={() => onSelect(chat.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={cn(
                              "text-sm truncate flex-1 min-w-0",
                              currentChatId === chat.id
                                ? "font-medium text-foreground"
                                : "text-foreground/90"
                            )}
                          >
                            {chat.title}
                          </h3>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0 bg-red-500 hover:bg-red-500 text-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-white" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete chat?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-base">
                                  This will delete <strong>{chat.title}</strong>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                <AlertDialogCancel className="m-0">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(chat.id)}
                                  className="bg-destructive hover:bg-destructive/90 m-0"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
