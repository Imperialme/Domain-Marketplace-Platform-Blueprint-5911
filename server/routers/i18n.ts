import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

const LANG_NAMES: Record<string, string> = {
  ar: "Arabic",
  fr: "French",
  pt: "Portuguese (Brazilian)",
  de: "German",
  zh: "Simplified Chinese",
  ja: "Japanese",
  es: "Spanish",
  ru: "Russian",
};

export const i18nRouter = router({
  translateBatch: publicProcedure
    .input(z.object({
      texts: z.array(z.string()).max(200),
      targetLang: z.enum(["ar", "fr", "pt", "de", "zh", "ja", "es", "ru"]),
    }))
    .mutation(async ({ input }) => {
      const { texts, targetLang } = input;
      const langName = LANG_NAMES[targetLang];

      if (!texts.length) return { lang: targetLang, translations: {} };

      // Deduplicate
      const unique = Array.from(new Set(texts.filter(t => t && t.trim().length > 0)));

      const prompt = `You are a professional B2B procurement platform translator. Translate the following UI strings from English to ${langName}.

Rules:
- Keep brand names, company names, acronyms (RFQ, OEM, AM, UAE, GCC, MENA) unchanged
- Keep technical terms professional and accurate
- For Arabic: use Modern Standard Arabic (MSA), right-to-left
- Keep the same tone: professional, concise, B2B-focused
- Return ONLY a valid JSON object mapping each original English string to its translation
- Do not add explanations or extra text

Strings to translate:
${JSON.stringify(unique, null, 2)}

Return format: {"original text": "translated text", ...}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a professional translator. Return only valid JSON." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" } as any,
        });

        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "{}";
        let parsed: Record<string, string> = {};
        try {
          parsed = JSON.parse(content);
        } catch {
          // If JSON parse fails, return empty (fallback to original)
          parsed = {};
        }

        // Ensure all requested texts have a translation (fallback to original)
        const translations: Record<string, string> = {};
        for (const text of unique) {
          translations[text] = parsed[text] || text;
        }

        return { lang: targetLang, translations };
      } catch {
        // On any error, return originals
        const translations: Record<string, string> = {};
        for (const text of unique) {
          translations[text] = text;
        }
        return { lang: targetLang, translations };
      }
    }),
});
