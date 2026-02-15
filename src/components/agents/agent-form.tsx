"use client";

import { useState, useRef } from "react";
import { ChevronDown, Upload, X, FileText, Phone, Loader2 } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hooks & Libs
import { useReferenceData } from "@/hooks/use-reference-data";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useAgent } from "@/hooks/use-agent";
import { Agent } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { useEffect } from "react";

// --- Helper Component ---

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">{badge} required</Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// --- Main Component ---

export interface AgentFormInitialData {
  id?: string;
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
  tools?: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

export function AgentForm({ mode, initialData }: AgentFormProps) {
  // 1. Data/API Hooks
  const {
    languages,
    voices,
    prompts,
    models,
    loading: dataLoading,
  } = useReferenceData();
  const {
    uploadedFiles,
    isDragging,
    handleFiles,
    removeFile,
    dragHandlers,
    ACCEPTED_TYPES,
  } = useFileUpload();
  const { saveAgent, startTestCall, isSaving, isTesting } = useAgent();
  const { toast } = useToast();
  const [showValidation, setShowValidation] = useState(false);
  const [showTestCallValidation, setShowTestCallValidation] = useState(false);

  // 2. Form State
  const [agentId, setAgentId] = useState<string | null>(
    initialData?.id || null
  ); // To store ID after creation
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);

  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");
  const [serviceDescription, setServiceDescription] = useState(
    initialData?.serviceDescription ?? ""
  );

  // Tool Switches
  const [allowHangUp, setAllowHangUp] = useState(
    initialData?.tools?.allowHangUp ?? true
  );
  const [allowCallback, setAllowCallback] = useState(
    initialData?.tools?.allowCallback ?? false
  );
  const [liveTransfer, setLiveTransfer] = useState(
    initialData?.tools?.liveTransfer ?? false
  );

  // Test Call State
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("male");
  const [testPhone, setTestPhone] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Computed
  const basicSettingsMissing = [
    agentName,
    callType,
    language,
    voice,
    prompt,
    model,
  ].filter((v) => !v).length;

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = isSaving
    ? "Saving..."
    : mode === "create"
    ? "Save Agent"
    : "Save Changes";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
         const hasContent = agentName || description || callScript;
      if (hasContent && !isSaving) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [agentName, description, callScript, isSaving]);

  const handleSave = async (isAutoSave = false) => {
    // Validate required fields
    if (!agentName || !callType || !language || !voice || !prompt || !model) {
      if (!isAutoSave) {
        setShowValidation(true);
        toast("Please fill in all required fields in Basic Settings.", "error");
      }
      return null;
    }

    const agentData: Omit<Agent, "id"> = {
      name: agentName,
      description,
      callType,
      language,
      voice,
      prompt,
      model,
      latency: latency[0],
      speed: speed[0],
      callScript,
      serviceDescription,
      attachments: uploadedFiles
        .filter((f) => f.status === "completed" && f.attachmentId)
        .map((f) => f.attachmentId!),
      tools: {
        allowHangUp,
        allowCallback,
        liveTransfer,
      },
    };

    try {
      const savedAgent = await saveAgent(agentId, agentData);
      setAgentId(savedAgent.id || null); // Ensure we capture the ID

      if (!isAutoSave) {
        toast("Agent saved successfully!", "success");
      }
      return savedAgent.id;
    } catch (error: any) {
      console.error("Save failed", error);
      if (!isAutoSave) {
        const message = error.message || "Failed to save agent.";
        toast(message, "error");
      }
      return null;
    }
  };

  const handleTestCall = async () => {
    if (!testPhone) {
      setShowTestCallValidation(true);
      toast("Please enter a phone number for the test call.", "warning");
      return;
    }

    const savedId = await handleSave(true);
    if (!savedId) return; // Save failed or validation error

    try {
      const res = await startTestCall(savedId, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });
      if (res.status === "initiated") {
        toast("Test call initiated successfully", "success");
      }
    } catch (error) {
      console.error("Test call error", error);
      toast("Failed to initiate test call.", "error");
    }
  };

  if (dataLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button onClick={() => handleSave(false)} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saveLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Sales Assistant"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className={
                    showValidation && !agentName ? "border-destructive" : ""
                  }
                />
                {showValidation && !agentName && (
                  <p className="text-xs text-destructive">
                    Agent Name is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Call Type <span className="text-destructive">*</span>
                </Label>
                <Select value={callType} onValueChange={setCallType}>
                  <SelectTrigger
                    className={`w-full ${
                      showValidation && !callType ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {showValidation && !callType && (
                  <p className="text-xs text-destructive">
                    Call Type is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Language <span className="text-destructive">*</span>
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger
                    className={`w-full ${
                      showValidation && !language ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && !language && (
                  <p className="text-xs text-destructive">
                    Language is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Voice <span className="text-destructive">*</span>
                </Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger
                    className={`w-full ${
                      showValidation && !voice ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices
                      .filter((v) => !language || v.language === language)
                      .map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{v.name}</span>
                            <Badge
                              variant="secondary"
                              className="text-xs h-5 px-1.5 font-normal"
                            >
                              {v.tag}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {showValidation && !voice && (
                  <p className="text-xs text-destructive">Voice is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Prompt <span className="text-destructive">*</span>
                </Label>
                <Select value={prompt} onValueChange={setPrompt}>
                  <SelectTrigger
                    className={`w-full ${
                      showValidation && !prompt ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && !prompt && (
                  <p className="text-xs text-destructive">Prompt is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger
                    className={`w-full ${
                      showValidation && !model ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {showValidation && !model && (
                  <p className="text-xs text-destructive">Model is required</p>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latency ({latency[0].toFixed(1)}s)</Label>
                  <Slider
                    value={latency}
                    onValueChange={setLatency}
                    min={0.3}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed ({speed[0]}%)</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={90}
                    max={130}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What should the agent say?"
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 3: Service Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Knowledge base about your service."
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Reference Data"
            description="Upload files for knowledge base."
          >
            <div className="space-y-4">
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
                {...dragHandlers}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>

              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(f.size)}
                        </span>
                        {f.status === "uploading" && (
                          <span className="text-xs text-blue-500 animate-pulse">
                            Uploading...
                          </span>
                        )}
                        {f.status === "completed" && (
                          <span className="text-xs text-green-500 font-medium">
                            Done
                          </span>
                        )}
                        {f.status === "error" && (
                          <span className="text-xs text-red-500">Error</span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                  <FileText className="h-10 w-10 mb-2" />
                  <p className="text-sm">No Files Available</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Section 5: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Agent capabilities and controls."
          >
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Allow agent to end the call.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-hangup"
                    checked={allowHangUp}
                    onCheckedChange={setAllowHangUp}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Allow agent to schedule callbacks.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-callback"
                    checked={allowCallback}
                    onCheckedChange={setAllowCallback}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Transfer directly to a human agent.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="switch-transfer"
                    checked={liveTransfer}
                    onCheckedChange={setLiveTransfer}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>
        </div>

        {/* Right Column — Test Call */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Test Call
                </CardTitle>
                <CardDescription>
                  Preview your agent (deducts credits).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="test-first-name">First Name</Label>
                      <Input
                        id="test-first-name"
                        placeholder="John"
                        value={testFirstName}
                        onChange={(e) => setTestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-last-name">Last Name</Label>
                      <Input
                        id="test-last-name"
                        placeholder="Doe"
                        value={testLastName}
                        onChange={(e) => setTestLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={testGender} onValueChange={setTestGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <PhoneInput
                      defaultCountry="EG"
                      value={testPhone}
                      onChange={(value) => setTestPhone(value)}
                      placeholder="Enter phone number"
                      className={
                        showTestCallValidation && !testPhone
                          ? "border-destructive rounded-md scale-100"
                          : ""
                      }
                    />
                    {showTestCallValidation && !testPhone && (
                      <p className="text-xs text-destructive">
                        Phone number is required
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleTestCall}
                    disabled={isTesting || isSaving}
                  >
                    {isTesting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Phone className="mr-2 h-4 w-4" />
                    )}
                    {isTesting ? "Connecting..." : "Start Test Call"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
