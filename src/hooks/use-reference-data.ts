import { useEffect, useState } from "react";
import { api, Language, Voice, Prompt, Model } from "@/lib/api";

export function useReferenceData() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [langRes, voiceRes, promptRes, modelRes] = await Promise.all([
          api.getLanguages(),
          api.getVoices(),
          api.getPrompts(),
          api.getModels(),
        ]);

        setLanguages(langRes);
        setVoices(voiceRes);
        setPrompts(promptRes);
        setModels(modelRes);
      } catch (err: unknown) {
        console.error("Failed to load reference data:", err);
        setError("Failed to load reference data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { languages, voices, prompts, models, loading, error };
}
