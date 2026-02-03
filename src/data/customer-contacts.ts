import { Customer } from "./customers";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  email: string;
  attempts: number;
  latestStatus: string;
  variables: Record<string, string>;
}

export interface CustomerListDetail extends Customer {
  variables: string[];
  allowDuplicates: boolean;
}

export const customerLists: CustomerListDetail[] = [
  {
    id: "1",
    name: "Acme Corporation",
    contacts: 12,
    createdAt: "Jan 5, 2025",
    modifiedAt: "Jan 20, 2025",
    variables: ["Company", "Plan"],
    allowDuplicates: false,
  },
  {
    id: "2",
    name: "TechStart Inc.",
    contacts: 5,
    createdAt: "Dec 12, 2024",
    modifiedAt: "Jan 18, 2025",
    variables: ["Role"],
    allowDuplicates: true,
  },
  {
    id: "3",
    name: "Global Solutions Ltd.",
    contacts: 34,
    createdAt: "Jan 10, 2025",
    modifiedAt: "Jan 25, 2025",
    variables: ["Region", "Tier", "Language"],
    allowDuplicates: false,
  },
  {
    id: "4",
    name: "Sunrise Retail",
    contacts: 8,
    createdAt: "Nov 22, 2024",
    modifiedAt: "Jan 15, 2025",
    variables: ["Store Location"],
    allowDuplicates: false,
  },
  {
    id: "5",
    name: "NextGen Media",
    contacts: 21,
    createdAt: "Jan 8, 2025",
    modifiedAt: "Jan 24, 2025",
    variables: ["Channel", "Subscription"],
    allowDuplicates: true,
  },
  {
    id: "6",
    name: "CloudNine Services",
    contacts: 17,
    createdAt: "Jan 14, 2025",
    modifiedAt: "Jan 26, 2025",
    variables: [],
    allowDuplicates: false,
  },
  {
    id: "7",
    name: "Pioneer Healthcare",
    contacts: 3,
    createdAt: "Dec 28, 2024",
    modifiedAt: "Jan 19, 2025",
    variables: ["Department"],
    allowDuplicates: false,
  },
  {
    id: "8",
    name: "BlueWave Logistics",
    contacts: 9,
    createdAt: "Jan 2, 2025",
    modifiedAt: "Jan 22, 2025",
    variables: ["Route", "Priority"],
    allowDuplicates: true,
  },
];

export const contacts: Record<string, Contact[]> = {
  "1": [
    {
      id: "c1",
      name: "John Smith",
      phone: "+1 555-0101",
      gender: "Male",
      email: "john.smith@acme.com",
      attempts: 3,
      latestStatus: "Completed",
      variables: { Company: "Acme Corp", Plan: "Enterprise" },
    },
    {
      id: "c2",
      name: "Sarah Johnson",
      phone: "+1 555-0102",
      gender: "Female",
      email: "sarah.j@acme.com",
      attempts: 1,
      latestStatus: "Pending",
      variables: { Company: "Acme Corp", Plan: "Pro" },
    },
    {
      id: "c3",
      name: "Michael Chen",
      phone: "+1 555-0103",
      gender: "Male",
      email: "m.chen@acme.com",
      attempts: 2,
      latestStatus: "No Answer",
      variables: { Company: "Acme Corp", Plan: "Enterprise" },
    },
    {
      id: "c4",
      name: "Emily Davis",
      phone: "+1 555-0104",
      gender: "Female",
      email: "emily.d@acme.com",
      attempts: 0,
      latestStatus: "New",
      variables: { Company: "Acme Ltd", Plan: "Starter" },
    },
    {
      id: "c5",
      name: "Robert Wilson",
      phone: "+1 555-0105",
      gender: "Male",
      email: "r.wilson@acme.com",
      attempts: 5,
      latestStatus: "Completed",
      variables: { Company: "Acme Corp", Plan: "Pro" },
    },
    {
      id: "c6",
      name: "Lisa Anderson",
      phone: "+1 555-0106",
      gender: "Female",
      email: "l.anderson@acme.com",
      attempts: 1,
      latestStatus: "Callback",
      variables: { Company: "Acme Ltd", Plan: "Enterprise" },
    },
  ],
  "2": [
    {
      id: "c7",
      name: "Alex Turner",
      phone: "+1 555-0201",
      gender: "Male",
      email: "alex@techstart.io",
      attempts: 2,
      latestStatus: "Completed",
      variables: { Role: "CTO" },
    },
    {
      id: "c8",
      name: "Maria Garcia",
      phone: "+1 555-0202",
      gender: "Female",
      email: "maria@techstart.io",
      attempts: 0,
      latestStatus: "New",
      variables: { Role: "Developer" },
    },
    {
      id: "c9",
      name: "James Lee",
      phone: "+1 555-0203",
      gender: "Male",
      email: "james@techstart.io",
      attempts: 1,
      latestStatus: "Pending",
      variables: { Role: "PM" },
    },
  ],
  "3": [
    {
      id: "c10",
      name: "Anna Müller",
      phone: "+49 170-1234",
      gender: "Female",
      email: "anna@globalsol.com",
      attempts: 4,
      latestStatus: "Completed",
      variables: { Region: "EMEA", Tier: "Gold", Language: "German" },
    },
    {
      id: "c11",
      name: "Kenji Tanaka",
      phone: "+81 90-5678",
      gender: "Male",
      email: "kenji@globalsol.com",
      attempts: 2,
      latestStatus: "Callback",
      variables: { Region: "APAC", Tier: "Platinum", Language: "Japanese" },
    },
    {
      id: "c12",
      name: "Carlos Rivera",
      phone: "+52 55-9012",
      gender: "Male",
      email: "carlos@globalsol.com",
      attempts: 1,
      latestStatus: "Pending",
      variables: { Region: "LATAM", Tier: "Silver", Language: "Spanish" },
    },
  ],
};
