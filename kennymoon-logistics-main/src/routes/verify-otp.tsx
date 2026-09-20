import { createFileRoute } from "@tanstack/react-router";

import { VerifyOtpPage } from "@/components/site/VerifyOtpPage";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({
    meta: [
      { title: "Verify Your Email Code | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Enter the 6-digit code we emailed you to finish creating your Kennymoon shipping account.",
      },
      { property: "og:title", content: "Verify Your Email Code | Kennymoon Int'l Ltd" },
      {
        property: "og:description",
        content: "Confirm your email with a 6-digit code and open your Kennymoon dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <VerifyOtpPage purpose="signup" />,
});
