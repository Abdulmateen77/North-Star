import {
  buildDocumentAnalysisUserPrompt,
  documentAnalysisSystemPrompt,
} from "../prompts/document-analysis.prompt";
import { AppError } from "@/lib/errors";
import type { AnalyzeDocumentContext, DocumentAnalysisResult } from "../types/analysis";
import { aiAnalysisFailure, aiTimeout, malformedAiResponse } from "../types/errors";
import { validateDocumentAnalysisResult } from "../validators/analysis.validator";

export type OpenAIChatCompletionClient = {
  chat: {
    completions: {
      create(input: Record<string, unknown>): Promise<{
        choices?: Array<{
          message?: {
            content?: string | null;
          };
        }>;
      }>;
    };
  };
};

export interface DocumentAgentOptions {
  model: string;
  timeoutMs: number;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(aiTimeout({ timeoutMs })), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export class DocumentAgent {
  constructor(
    private readonly client: OpenAIChatCompletionClient,
    private readonly options: DocumentAgentOptions,
  ) {}

  async analyze(
    extractedText: string,
    context: AnalyzeDocumentContext,
  ): Promise<DocumentAnalysisResult> {
    const trimmedText = extractedText.trim();

    if (!trimmedText) {
      throw malformedAiResponse({ message: "Extracted text is empty." });
    }

    let completion: Awaited<ReturnType<OpenAIChatCompletionClient["chat"]["completions"]["create"]>>;

    try {
      completion = await withTimeout(
        this.client.chat.completions.create({
          model: this.options.model,
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: documentAnalysisSystemPrompt },
            {
              role: "user",
              content: buildDocumentAnalysisUserPrompt(trimmedText),
            },
          ],
          metadata: {
            documentId: context.documentId,
            domain: "health-records",
          },
        }),
        this.options.timeoutMs,
      );
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw aiAnalysisFailure("AI document analysis failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw malformedAiResponse({ message: "AI response did not contain JSON content." });
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw malformedAiResponse({
        message: "AI response was not valid JSON.",
        parseError: error instanceof Error ? error.message : String(error),
      });
    }

    return validateDocumentAnalysisResult(parsed, trimmedText);
  }
}
