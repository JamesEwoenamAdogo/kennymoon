import { createFileRoute } from "@tanstack/react-router";

import { VerifyOtpPage } from "@/components/site/VerifyOtpPage";

export const Route = createFileRoute("/verify-staff")({
  head: () => ({
    meta: [
      { title: "Activate Your Admin Access | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Invited staff enter their 6-digit code here to activate Kennymoon admin portal access.",
      },
      { property: "og:title", content: "Activate Your Admin Access | Kennymoon Int'l Ltd" },
      {
        property: "og:description",
        content: "Enter your invite code to activate Kennymoon admin access.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VerifyOtpPage purpose="admin_invite" />,
});
