"use client";

import { useState } from "react";
import { StreamData } from "@/types/chat";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StreamDataViewProps {
  streamData: StreamData;
}

export function StreamDataView({ streamData }: StreamDataViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out internal tools that shouldn't be displayed
  const filteredToolCalls =
    streamData.toolCalls?.filter(
      (call) =>
        ![
          "ls",
          "read_file",
          "write_file",
          "edit_file",
          "glob",
          "grep",
        ].includes(call.tool)
    ) || [];
  const filteredToolResults =
    streamData.toolResults?.filter(
      (result) =>
        ![
          "ls",
          "read_file",
          "write_file",
          "edit_file",
          "glob",
          "grep",
        ].includes(result.tool)
    ) || [];

  const hasData =
    (streamData.thinking && streamData.thinking.length > 0) ||
    filteredToolCalls.length > 0 ||
    filteredToolResults.length > 0;

  if (!hasData) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-xs font-normal h-8 mb-2"
        >
          <div className="flex items-center gap-2">
            <Code className="h-3 w-3" />
            <span>Query/Stream Data</span>
            {filteredToolCalls.length > 0 && (
              <span className="text-muted-foreground">
                ({filteredToolCalls.length} tools)
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">
        <div className="rounded-lg border bg-muted/30 p-3 space-y-3 max-h-[400px] overflow-y-auto">
          {/* Start Info */}
          {streamData.start?.query && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground">
                Query
              </div>
              <div className="text-sm bg-background p-2 rounded border font-mono">
                {streamData.start.query}
              </div>
              {streamData.start.timestamp && (
                <div className="text-xs text-muted-foreground">
                  {streamData.start.timestamp}
                </div>
              )}
            </div>
          )}

          {/* Thinking */}
          {streamData.thinking && streamData.thinking.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground">
                Thinking Process
              </div>
              <div className="text-sm bg-background p-2 rounded border max-h-[200px] overflow-y-auto">
                {streamData.thinking.map((thought, idx) => (
                  <div key={idx} className="mb-1 last:mb-0">
                    {thought}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Calls */}
          {filteredToolCalls.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Tool Calls ({filteredToolCalls.length})
              </div>
              <div className="space-y-2">
                {filteredToolCalls.map((call, idx) => (
                  <div key={idx} className="bg-background p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-primary" />
                      <span className="text-xs font-mono font-semibold">
                        {call.tool}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Results */}
          {filteredToolResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">
                Tool Results ({filteredToolResults.length})
              </div>
              <div className="space-y-2">
                {filteredToolResults.map((result, idx) => (
                  <div key={idx} className="bg-background p-2 rounded border">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-mono font-semibold">
                        {result.tool}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
