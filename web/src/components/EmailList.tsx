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

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
}

export function EmailList({ emails, onSelectEmail }: EmailListProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-2">
      {emails.map((email, index) => (
        <button
          key={email.id}
          type="button"
          onClick={() => onSelectEmail(email)}
          className="w-full text-left p-4 rounded-xl border bg-card border-border hover:bg-muted/50 transition-all duration-200 ease-out active:scale-[0.98]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(8px)",
            transitionDelay: mounted ? `${index * 50}ms` : "0ms",
            transitionDuration: "300ms",
            transitionProperty: "opacity, transform, background-color",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{email.from}</p>
              <p className="text-sm font-semibold mt-1 truncate">
                {email.subject}
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {email.body}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {email.date}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
