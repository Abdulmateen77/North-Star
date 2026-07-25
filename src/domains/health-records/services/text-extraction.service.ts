import { createOpenAIClient } from "@/lib/openai/client";
import { AppError } from "@/lib/errors";

import type { OpenAIChatCompletionClient } from "../agents/document.agent";
import { getEnv } from "@/lib/env";
import { ocrFailure } from "../types/errors";
import type { DocumentTextExtractor, ExtractTextInput } from "../types/storage";

export interface TextExtractionServiceOptions {
  imageOcrModel?: string;
  openAIClient?: OpenAIChatCompletionClient;
}

export class TextExtractionService implements DocumentTextExtractor {
  constructor(private readonly options: TextExtractionServiceOptions = {}) {}

  async extractText(input: ExtractTextInput): Promise<string> {
    if (input.document.mimeType === "application/pdf") {
      return this.extractPdfText(input.file);
    }

    if (input.document.mimeType === "image/jpeg" || input.document.mimeType === "image/png") {
      return this.extractImageText(input.file, input.document.mimeType);
    }

    throw ocrFailure("Unsupported healthcare document MIME type for text extraction.", {
      mimeType: input.document.mimeType,
    });
  }

  private async extractPdfText(file: Buffer): Promise<string> {
    try {
      const pdfParseModule = (await import("pdf-parse")) as unknown as {
        default?: (buffer: Buffer) => Promise<{ text: string }>;
        PDFParse?: new (options: { data: Buffer }) => {
          getText(): Promise<{ text: string }>;
          destroy?(): Promise<void> | void;
        };
      };
      let text: string;

      if (pdfParseModule.default) {
        const result = await pdfParseModule.default(file);
        text = result.text.trim();
      } else if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({ data: file });
        const result = await parser.getText();
        text = result.text.trim();
        await parser.destroy?.();
      } else {
        throw ocrFailure("PDF parser is not available.");
      }

      if (!text) {
        throw ocrFailure("PDF text extraction returned empty text.");
      }

      return text;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw ocrFailure("PDF text extraction failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async extractImageText(file: Buffer, mimeType: string): Promise<string> {
    const client = this.options.openAIClient ?? (createOpenAIClient() as unknown as OpenAIChatCompletionClient);
    const model = this.options.imageOcrModel ?? getEnv().OPENAI_OCR_MODEL;
    const dataUrl = `data:${mimeType};base64,${file.toString("base64")}`;

    try {
      const completion = await client.chat.completions.create({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an OCR engine. Return JSON only as {\"text\":\"...\"}. Transcribe only visible text. Do not summarize or infer missing words.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe all visible text from this healthcare document image." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      const content = completion.choices?.[0]?.message?.content;

      if (!content) {
        throw ocrFailure("Image OCR returned an empty response.");
      }

      const parsed = JSON.parse(content) as { text?: unknown };
      const text = typeof parsed.text === "string" ? parsed.text.trim() : "";

      if (!text) {
        throw ocrFailure("Image OCR returned empty text.");
      }

      return text;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw ocrFailure("Image OCR failed.", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
