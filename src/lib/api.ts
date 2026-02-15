export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// --- Types ---

export interface Language {
  id: string;
  name: string;
  code: string;
}

export interface Voice {
  id: string;
  name: string;
  tag: string;
  language: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id?: string;
  name: string;
  description: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
  model: string;
  latency: number;
  speed: number;
  callScript: string;
  serviceDescription: string;
  attachments: string[];
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

export interface Attachment {
  id: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadUrlResponse {
  key: string;
  signedUrl: string;
  expiresIn: number;
}

export interface TestCallParams {
  firstName: string;
  lastName: string;
  gender: string;
  phoneNumber: string;
}

export interface TestCallResponse {
  success: boolean;
  callId: string;
  agentId: string;
  status: string;
}

// --- API Client ---

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  // Handle empty responses (like 204)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Reference Data
  getLanguages: () => request<Language[]>("/languages"),
  getVoices: () => request<Voice[]>("/voices"),
  getPrompts: () => request<Prompt[]>("/prompts"),
  getModels: () => request<Model[]>("/models"),

  // Agent CRUD
  createAgent: (data: Omit<Agent, "id">) =>
    request<Agent>("/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateAgent: (id: string, data: Partial<Agent>) =>
    request<Agent>(`/agents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // File Upload (3-Step)
  uploadFile: async (file: File): Promise<Attachment> => {
    // 1. Get signed URL
    const { signedUrl, key } = await request<UploadUrlResponse>(
      "/attachments/upload-url",
      {
        method: "POST",
      }
    );

    // 2. Upload to signed URL (Direct PUT to the URL, not our API)
    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": "application/octet-stream", // Required by mock API usually
      },
    });

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload file content: ${uploadRes.statusText}`);
    }

    // 3. Register attachment
    return request<Attachment>("/attachments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      }),
    });
  },

  // Test Call
  startTestCall: (agentId: string, params: TestCallParams) =>
    request<TestCallResponse>(`/agents/${agentId}/test-call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
};
