/**
 * The strict document standard for "Sell with us" submissions.
 * Shared by the public form, the API validator, and the admin review panel.
 */

export const MAX_DOC_BYTES = 8 * 1024 * 1024; // 8 MB per document

export const DOC_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export const DOC_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export type DocRequirement = {
  type: "title" | "sitePlan" | "idCard" | "taxReceipt" | "permit";
  label: string;
  short: string;
  required: boolean;
  note: string;
};

export const DOCUMENT_REQUIREMENTS: DocRequirement[] = [
  {
    type: "title",
    label: "Land Title Certificate / Indenture",
    short: "Title Deed",
    required: true,
    note: "Proves ownership — the name must match the owner's Ghana Card.",
  },
  {
    type: "sitePlan",
    label: "Site Plan",
    short: "Site Plan",
    required: true,
    note: "Stamped by a licensed surveyor, showing plot boundaries and area.",
  },
  {
    type: "idCard",
    label: "Owner's Ghana Card (scan)",
    short: "Ghana Card",
    required: true,
    note: "Clear, colour scan of the front of the owner's national ID.",
  },
  {
    type: "taxReceipt",
    label: "Current Property Tax Receipt",
    short: "Tax Receipt",
    required: true,
    note: "Issued by your district assembly for the current year.",
  },
  {
    type: "permit",
    label: "Building Permit (optional)",
    short: "Permit",
    required: false,
    note: "Include it if the structure is under 15 years old.",
  },
];

export const REQUIRED_DOC_TYPES = DOCUMENT_REQUIREMENTS.filter(
  (d) => d.required,
).map((d) => d.type);

export const SUBMISSION_STATUSES = ["pending", "reviewing", "approved", "rejected"] as const;

export function docLabel(type: string): string {
  return DOCUMENT_REQUIREMENTS.find((d) => d.type === type)?.label ?? type;
}
