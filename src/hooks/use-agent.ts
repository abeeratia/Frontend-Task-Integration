import { useState } from "react";
import { api, Agent } from "@/lib/api";

export function useAgent() {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAgent = async (agentId: string | null, data: Omit<Agent, "id">) => {
    setIsSaving(true);
    setError(null);
    try {
      let result: Agent;
      if (agentId) {
        result = await api.updateAgent(agentId, data);
      } else {
        result = await api.createAgent(data);
      }
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save agent";
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const startTestCall = async (agentId: string, params: any) => {
    setIsTesting(true);
    setError(null);
    try {
      const result = await api.startTestCall(agentId, params);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start test call";
      setError(message);
      throw err;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    saveAgent,
    startTestCall,
    isSaving,
    isTesting,
    error,
  };
}
