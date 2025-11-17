import { NextRequest, NextResponse } from "next/server";

// DropAnalysis API URL - defaults to localhost:8000
const DROPANALYSIS_API_URL =
  process.env.DROPANALYSIS_API_URL || "http://localhost:8000";

interface ChatSettings {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  stockTicker?: string;
  formTypes?: string;
  deepAnalysis?: boolean;
}

// Helper to format date for DropAnalysis (YYYY-MM-DD)
function formatDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const { messages, settings } = await req.json();

    // Validate DropAnalysis URL
    if (!DROPANALYSIS_API_URL) {
      return NextResponse.json(
        { error: "DropAnalysis API URL is not configured" },
        { status: 500 }
      );
    }

    // Get the last user message
    const lastMessage = messages
      .slice()
      .reverse()
      .find((m: any) => m.role === "user");
    const query = lastMessage?.content || "";

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const chatSettings: ChatSettings = settings || {};

    // Determine which endpoint to use based on settings
    const hasTicker = chatSettings.stockTicker?.trim();
    const hasFormTypes = chatSettings.formTypes?.trim();
    const hasDateRange = chatSettings.startDate || chatSettings.endDate;

    // Use structured analysis if ticker is provided
    const useStructuredAnalysis = !!hasTicker;

    let dropAnalysisUrl: string;
    let urlParams: URLSearchParams;

    if (useStructuredAnalysis) {
      // Use /analyze/stream endpoint for structured analysis
      urlParams = new URLSearchParams();
      urlParams.append("ticker", chatSettings.stockTicker!.trim());

      if (hasFormTypes) {
        urlParams.append("form_types", chatSettings.formTypes!.trim());
      } else {
        urlParams.append("form_types", "10-K"); // Default
      }

      const startDate = formatDate(chatSettings.startDate);
      const endDate = formatDate(chatSettings.endDate);

      if (startDate) {
        urlParams.append("start_date", startDate);
      }
      if (endDate) {
        urlParams.append("end_date", endDate);
      }

      // Use deep_analysis from settings
      const deepAnalysis = chatSettings.deepAnalysis || false;
      urlParams.append("deep_analysis", deepAnalysis.toString());

      // If user provided a query, use it as analysis_goal
      if (query.trim() && query.trim().length > 10) {
        urlParams.append("analysis_goal", query.trim());
      }

      dropAnalysisUrl = `${DROPANALYSIS_API_URL}/analyze/stream?${urlParams.toString()}`;
    } else {
      // Use /query/stream endpoint for free-form queries
      urlParams = new URLSearchParams();
      urlParams.append("query", query);
      dropAnalysisUrl = `${DROPANALYSIS_API_URL}/query/stream?${urlParams.toString()}`;
    }

    // Log the URL being called for debugging
    console.log("Calling DropAnalysis API:", dropAnalysisUrl);
    console.log("Settings:", JSON.stringify(chatSettings, null, 2));

    // Fetch from DropAnalysis
    let response: Response;
    try {
      response = await fetch(dropAnalysisUrl, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
      });
    } catch (fetchError: any) {
      console.error("Failed to connect to DropAnalysis API:", fetchError);
      return NextResponse.json(
        {
          error: `Failed to connect to DropAnalysis API at ${DROPANALYSIS_API_URL}. Please ensure the backend is running. Error: ${fetchError.message}`,
        },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DropAnalysis API Error:", response.status, errorText);
      return NextResponse.json(
        {
          error:
            errorText || `DropAnalysis API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    // Create a readable stream that transforms DropAnalysis events to frontend format
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body from DropAnalysis");
          }

          let buffer = "";
          let lastAnswerLength = 0;
          let currentEventType = "";
          let streamData: {
            thinking: string[];
            toolCalls: Array<{
              tool: string;
              input: string;
              timestamp: number;
            }>;
            toolResults: Array<{
              tool: string;
              output: string;
              timestamp: number;
            }>;
            start?: { query?: string; timestamp?: string };
          } = {
            thinking: [],
            toolCalls: [],
            toolResults: [],
          };

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];

              if (line.startsWith("event: ")) {
                currentEventType = line.slice(7).trim();
                continue;
              }

              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim();
                if (!dataStr) continue;

                try {
                  const data = JSON.parse(dataStr);

                  // Handle different event types from DropAnalysis
                  if (currentEventType === "final_answer" && data.answer) {
                    // final_answer event - stream only the new portion
                    const answer = data.answer;
                    const newContent = answer.slice(lastAnswerLength);
                    if (newContent) {
                      lastAnswerLength = answer.length;
                      // Stream in chunks for better performance
                      const chunkSize = 50;
                      for (let j = 0; j < newContent.length; j += chunkSize) {
                        const chunk = newContent.slice(j, j + chunkSize);
                        controller.enqueue(
                          encoder.encode(
                            `data: ${JSON.stringify({ content: chunk })}\n\n`
                          )
                        );
                      }
                    }
                  } else if (currentEventType === "thinking" && data.content) {
                    // thinking event - accumulate and stream
                    streamData.thinking.push(data.content);
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          content: data.content,
                          streamData: streamData,
                        })}\n\n`
                      )
                    );
                  } else if (currentEventType === "tool_call" && data.tool) {
                    // tool_call event - accumulate
                    streamData.toolCalls.push({
                      tool: data.tool,
                      input: data.input || "",
                      timestamp: Date.now(),
                    });
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          streamData: streamData,
                        })}\n\n`
                      )
                    );
                  } else if (currentEventType === "tool_result" && data.tool) {
                    // tool_result event - accumulate
                    streamData.toolResults.push({
                      tool: data.tool,
                      output: data.output || "",
                      timestamp: Date.now(),
                    });
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          streamData: streamData,
                        })}\n\n`
                      )
                    );
                  } else if (currentEventType === "start" && data.query) {
                    // start event - store query info
                    streamData.start = {
                      query: data.query,
                      timestamp: data.timestamp,
                    };
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          streamData: streamData,
                        })}\n\n`
                      )
                    );
                  } else if (currentEventType === "error" && data.error) {
                    // error event
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          content: `\n\nError: ${data.error}`,
                        })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  // Skip invalid JSON
                  console.warn("Failed to parse SSE data:", dataStr);
                }
              }
            }
          }

          // Send final stream data before completion
          if (
            streamData.thinking.length > 0 ||
            streamData.toolCalls.length > 0 ||
            streamData.toolResults.length > 0
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  streamData: streamData,
                  final: true,
                })}\n\n`
              )
            );
          }

          // Send done signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error: any) {
          console.error("Stream processing error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                content: `\n\nError: ${
                  error.message || "Stream processing failed"
                }`,
              })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat request" },
      { status: 500 }
    );
  }
}
