
import { GoogleGenAI } from "@google/genai";
import { Resolution, AspectRatio } from "../types";

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateImage(prompt: string, config: { resolution: Resolution, aspectRatio: AspectRatio }) {
    const ai = this.getClient();
    // High quality 2K/4K requires Gemini 3 Pro Image
    const modelName = config.resolution === Resolution.ONE_K ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: config.aspectRatio,
            imageSize: config.resolution as any
          }
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data returned from model.");
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_RESET_REQUIRED");
      }
      throw error;
    }
  }

  static async editImage(base64Image: string, prompt: string) {
    const ai = this.getClient();
    const modelName = 'gemini-2.5-flash-image';

    const mimeType = base64Image.split(';')[0].split(':')[1];
    const base64Data = base64Image.split(',')[1];

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data returned from model.");
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_RESET_REQUIRED");
      }
      throw error;
    }
  }

  static async upscaleImage(base64Image: string, originalPrompt: string) {
    const ai = this.getClient();
    const modelName = 'gemini-3-pro-image-preview';

    const mimeType = base64Image.split(';')[0].split(':')[1];
    const base64Data = base64Image.split(',')[1];

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            { text: `Upscale this image to ultra-high 4K resolution, enhancing fine details and textures while maintaining the original composition: ${originalPrompt}` }
          ]
        },
        config: {
          imageConfig: {
            imageSize: '4K' as any
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Upscaling failed to return image data.");
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_RESET_REQUIRED");
      }
      throw error;
    }
  }
}
