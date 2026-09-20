import { createFileRoute } from "@tanstack/react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_LABEL, STATUS_ORDER } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/training")({
  component: AdminTraining,
});

const GUIDES = [
  {
    title: "How to import the warehouse arrivals sheet",
    steps: [
      "Open Warehouse import in the left menu.",
      "Ask the China warehouse for the arrivals export. It must have a column headed tracking_number. Optional columns: warehouse_city and photo_url.",
      "Set the default warehouse city (e.g. Guangzhou, China) — it is applied to any row without its own city.",
      "Choose the .csv or .xlsx file. The import runs immediately.",
      "Read the summary: rows processed, matched, unmatched. Matching orders that were still 'Not Yet in Warehouse' are now 'In warehouse' and the customer sees it instantly.",
      "Check the unmatched list. It usually means a typo in the sheet, or the customer has not logged that tracking number yet. Re-upload a corrected sheet — re-importing the same numbers is safe.",
    ],
  },
  {
    title: "How to run a bulk status action (tagging a batch)",
    steps: [
      "Open Orders. Filter by status — e.g. In warehouse — so the batch you are tagging is on screen.",
      "Tick the checkbox on each order in the batch, or use the header checkbox to select everything shown.",
      "A green action bar appears at the top with the only allowed next step for that batch.",
      "If you are marking In transit, enter the estimated delivery date first — it is applied to the whole batch and shown to every customer in it.",
      "Click the Mark as… button. Each order gets its own audit entry sharing one batch reference.",
      "Note: all selected orders must be at the same current stage. The system will not let you skip stages (e.g. Not Yet in Warehouse straight to Arrived).",
    ],
  },
  {
    title: "How to confirm a payment",
    steps: [
      "Open Payments. Everything awaiting review is listed with the receipt image, amount and reference.",
      "Compare the receipt against the bank account before confirming.",
      "Click Confirm payment. The order moves to Payment confirmed and your name is stored against it.",
      "If the receipt is unreadable or wrong, type a short note and click Reject / request reupload. The customer is returned to the payment step and can upload again.",
      "When the goods are handed over, select the order in Orders and mark it Completed.",
    ],
  },
  {
    title: "How to search by partial tracking number",
    steps: [
      "Open Orders.",
      "Type any part of the number in the tracking box — the last 4 or 5 digits is enough.",
      "Combine it with the date range or the status filter to narrow a busy day.",
      "The customer's name and business name show on every row, so you can confirm you have the right person before acting.",
    ],
  },
  {
    title: "How to create a staff account and give it access",
    steps: [
      "Open Staff & roles. Only a Super Admin sees the controls on this screen.",
      "In 'Set or reset a staff password', type the person's work email and a password of at least 8 characters, then click Save password. This also creates the account if it does not exist yet.",
      "In the roles section, add the same email and pick the role: Super Admin (everything, including rates and staff), Operations (orders and payments), Warehouse Staff (imports and warehouse stages) or Support (read only).",
      "Send the person the password privately — never in a group chat — and tell them to sign in from the Admin Portal button on the website.",
      "They enter the work email and password, then the 6-digit code we email them. The portal only opens after the code is accepted.",
      "To remove someone, revoke their role here. Their password stops being useful immediately because the portal checks the role on every visit.",
    ],
  },
  {
    title: "How the 6-digit email codes work",
    steps: [
      "Every sign-in — customer or staff — gets a fresh 6-digit code by email. We never send a clickable magic link.",
      "A code lasts 10 minutes and can only be used once. If it expires, use 'Send a new code'.",
      "Staff sign-in is two steps: work email + password first, then the code. A wrong password never reaches the code step.",
      "If a customer says no code arrived: ask them to check spam, confirm the email spelling on their profile in Customers, then have them request a new code.",
    ],
  },
  {
    title: "How to update rates and the exchange rate",
    steps: [
      "Open Rates & FX. Only a Super Admin can change these numbers.",
      "Sea freight is fixed Naira per CBM per pickup point: Trade Fair, Ajao Estate (two bands), Onitsha and Kano. Edit the figure and click Save.",
      "Air freight is priced in dollars per kg: Normal cargo, Special goods (Hong Kong) and Express. Customers see the Naira figure converted at the live market rate.",
      "The saved exchange rate on this page is the fallback used if the live market feed is unreachable — keep it close to the real market rate.",
      "Anything you save here shows on the public price calculator within a few minutes.",
    ],
  },
];


function AdminTraining() {
  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Training area</h2>
        <p className="text-sm text-muted-foreground">
          Everything a new staff member needs for day-to-day work in this portal.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">The status pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {STATUS_ORDER.map((status, index) => (
              <li key={status} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span>{STATUS_LABEL[status]}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
        {GUIDES.map((guide) => (
          <AccordionItem key={guide.title} value={guide.title}>
            <AccordionTrigger className="text-left text-sm font-bold">{guide.title}</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
