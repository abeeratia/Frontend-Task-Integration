"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  customerLists,
  contacts as allContacts,
} from "@/data/customer-contacts";

const PAGE_SIZE = 5;

const statusVariant = (status: string) => {
  switch (status) {
    case "Completed":
      return "default";
    case "Pending":
      return "secondary";
    case "No Answer":
      return "destructive";
    case "Callback":
      return "outline";
    default:
      return "secondary";
  }
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const customerList = customerLists.find((c) => c.id === id);
  const contactList = allContacts[id] ?? [];

  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Add customer form state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newGender, setNewGender] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newVariables, setNewVariables] = useState<Record<string, string>>({});

  const totalPages = Math.max(1, Math.ceil(contactList.length / PAGE_SIZE));
  const paginatedContacts = contactList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const resetAddForm = () => {
    setNewName("");
    setNewPhone("");
    setNewGender("");
    setNewEmail("");
    setNewVariables({});
  };

  if (!customerList) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Customer list not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/customers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{customerList.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Email</TableHead>
              {customerList.variables.map((variable) => (
                <TableHead key={variable} className="font-semibold text-muted-foreground/70">{variable}</TableHead>
              ))}
              <TableHead>Attempts</TableHead>
              <TableHead>Latest Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6 + customerList.variables.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No contacts yet. Add a customer or upload a file to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              paginatedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.gender}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  {customerList.variables.map((variable) => (
                    <TableCell key={variable} className="font-light text-muted-foreground">
                      {contact.variables[variable] ?? "—"}
                    </TableCell>
                  ))}
                  <TableCell>{contact.attempts}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(contact.latestStatus)}>
                      {contact.latestStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Customer Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Add a new contact to {customerList.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                placeholder="Full name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Contacts (Phone)</Label>
              <Input
                id="contact-phone"
                placeholder="+1 555-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-gender">Gender</Label>
              <Select value={newGender} onValueChange={setNewGender}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                placeholder="email@example.com"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            {customerList.variables.map((variable) => (
              <div key={variable} className="space-y-2">
                <Label>{variable}</Label>
                <Input
                  placeholder={variable}
                  value={newVariables[variable] ?? ""}
                  onChange={(e) =>
                    setNewVariables((prev) => ({
                      ...prev,
                      [variable]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // handle add contact
                setAddDialogOpen(false);
                resetAddForm();
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Contacts</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to add contacts in bulk.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag & drop your file here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports CSV and Excel (.xlsx) files
              </p>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="mt-4 max-w-xs"
              />
            </div>
            <Button variant="link" className="px-0">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // handle upload
                setUploadDialogOpen(false);
              }}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
