"use client";

import { Copy, Check, Pencil, Flag } from "lucide-react";
import { ActionButton } from "../_actionButton";

interface UserMessageActionsProps {
  onCopy: () => void;
  onEdit: () => void;
  onFlag: () => void;
  copied: boolean;
  flagged: boolean;
  isEditing: boolean;
}

export function UserMessageActions({
  onCopy,
  onEdit,
  onFlag,
  copied,
  flagged,
  isEditing,
}: UserMessageActionsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 mt-2 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
      <ActionButton
        icon={
          copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />
        }
        tooltip="Copy"
        onClick={onCopy}
      />

      {!isEditing && (
        <ActionButton
          icon={<Pencil className="h-4 w-4" />}
          tooltip="Edit"
          onClick={onEdit}
        />
      )}

      <ActionButton
        icon={<Flag className="h-4 w-4" />}
        tooltip={flagged ? "Unflag message" : "Flag message"}
        onClick={onFlag}
        active={flagged}
      />
    </div>
  );
}
