"use client";

import { useEffect, useState } from "react";

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

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onLinkClick: (link: EmailLink) => void;
  onOpenExtension: () => void;
}

export function EmailDetail({
  email,
  onBack,
  onLinkClick,
  onOpenExtension,
}: EmailDetailProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="space-y-4"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 250ms ease-out, transform 250ms ease-out",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        <button
          type="button"
          onClick={onOpenExtension}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Extension
        </button>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {email.date}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold">{email.subject}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {email.from.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                From: {email.from}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed">{email.body}</p>

            {email.links.length > 0 && (
              <div className="mt-6 pt-5 border-t space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Links in this email ({email.links.length})
                </p>
                {email.links.map((link, index) => (
                  <button
                    key={`${link.text}-${link.url}`}
                    type="button"
                    onClick={() => onLinkClick(link)}
                    className="block w-full text-left p-4 rounded-xl border bg-muted/50 hover:bg-muted transition-all duration-200 ease-out active:scale-[0.98]"
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <span className="flex items-center justify-between">
                      <span className="font-semibold text-blue-600">
                        {link.text}
                      </span>
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </span>
                    <span className="text-xs text-muted-foreground block mt-2 truncate">
                      {link.url}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
