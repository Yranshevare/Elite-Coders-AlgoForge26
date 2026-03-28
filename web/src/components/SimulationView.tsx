"use client";

import { useState } from "react";
import { EmailDetail } from "./EmailDetail";
import { EmailList } from "./EmailList";
import { ExtensionSidebar } from "./ExtensionSidebar";
import { HackAlertModal } from "./HackAlertModal";

interface EmailLink {
  text: string;
  url: string;
  isPhishing: boolean;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  links: EmailLink[];
  isPhishing: boolean;
  date: string;
}

const sampleEmails: Email[] = [
  {
    id: "1",
    from: "security@amaz0n-verify.com",
    subject: "URGENT: Your account has been compromised!",
    body: "We detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your information immediately.",
    links: [
      {
        text: "Verify Now",
        url: "https://amaz0n-verify.com/secure",
        isPhishing: true,
      },
      {
        text: "Learn More",
        url: "https://amaz0n-verify.com/info",
        isPhishing: true,
      },
    ],
    isPhishing: true,
    date: "2 min ago",
  },
  {
    id: "2",
    from: "support@paypa1.com",
    subject: "Your PayPal account has been limited",
    body: "We have temporarily limited your account access. Please confirm your identity to restore full access to your account.",
    links: [
      {
        text: "Confirm Identity",
        url: "https://paypa1.com/verify",
        isPhishing: true,
      },
      {
        text: "View Details",
        url: "https://paypa1.com/account",
        isPhishing: true,
      },
    ],
    isPhishing: true,
    date: "15 min ago",
  },
  {
    id: "3",
    from: "noreply@micros0ft.com",
    subject: "Action Required: Verify your email",
    body: "Your Microsoft 365 subscription is about to expire. Update your payment information to continue using our services.",
    links: [
      {
        text: "Update Payment",
        url: "https://micros0ft.com/payment",
        isPhishing: true,
      },
    ],
    isPhishing: true,
    date: "1 hour ago",
  },
  {
    id: "4",
    from: "alert@bankofamerica-secure.com",
    subject: "Unusual sign-in attempt detected",
    body: "We noticed a new device signed into your account from IP Address: 192.168.1.1 in Moscow, Russia. If this wasn't you, secure your account immediately.",
    links: [
      {
        text: "Secure My Account",
        url: "https://bankofamerica-secure.com/lock",
        isPhishing: true,
      },
      {
        text: "Report Not Me",
        url: "https://bankofamerica-secure.com/false",
        isPhishing: true,
      },
    ],
    isPhishing: true,
    date: "2 hours ago",
  },
  {
    id: "5",
    from: "newsletter@github.com",
    subject: "New features coming to GitHub",
    body: "We're excited to announce new features for all developers. Check out what's new and how to get started.",
    links: [
      { text: "Read More", url: "https://github.com/blog", isPhishing: false },
    ],
    isPhishing: false,
    date: "1 day ago",
  },
];

export function SimulationView() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showHackAlert, setShowHackAlert] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const [hackAlertMode, setHackAlertMode] = useState<"extension" | "link">(
    "link",
  );
  const [clickedLink, setClickedLink] = useState<EmailLink | null>(null);

  const handleLinkClick = (link: EmailLink) => {
    setClickedLink(link);
    setHackAlertMode("link");
    setShowHackAlert(true);
  };

  const handleExtensionClick = () => {
    setHackAlertMode("extension");
    setShowHackAlert(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex h-full gap-0">
        <div className="w-[380px] shrink-0 flex flex-col border-r">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="size-3 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Phishing Simulation</h2>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Click on links in emails to test detection
            </p>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <EmailList emails={sampleEmails} onSelectEmail={setSelectedEmail} />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {selectedEmail ? (
            <div className="p-6">
              <EmailDetail
                email={selectedEmail}
                onBack={() => setSelectedEmail(null)}
                onLinkClick={handleLinkClick}
                onOpenExtension={handleExtensionClick}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-muted-foreground/50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <p className="text-muted-foreground">Select an email to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <HackAlertModal
        isOpen={showHackAlert}
        onClose={() => setShowHackAlert(false)}
        link={clickedLink || undefined}
        mode={hackAlertMode}
      />

      <ExtensionSidebar
        isOpen={showExtension}
        onClose={() => setShowExtension(false)}
      />
    </div>
  );
}
