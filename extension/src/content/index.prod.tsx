// Gmail email extractor and side panel trigger
(() => {
  function extractEmailDetails() {
    try {
      const emailSelectors = [
        '[data-message-id] [role="presentation"]',
        '.a3s.aiL',
        '[role="main"] [role="article"]',
        '[data-message-id]',
        '.gs',
        '[itemprop="description"]'
      ];

      let emailElement = null;
      for (const selector of emailSelectors) {
        emailElement = document.querySelector(selector);
        if (emailElement && emailElement.textContent?.trim()) {
          break;
        }
      }

      if (!emailElement) {
        emailElement = document.body;
      }

      const clonedElement = emailElement.cloneNode(true) as Element;

      const styles = clonedElement.querySelectorAll('style');
      styles.forEach((style) => { style.remove(); });

      const scripts = clonedElement.querySelectorAll('script');
      scripts.forEach((script) => { script.remove(); });

      const linkTags = clonedElement.querySelectorAll('link[rel="stylesheet"]');
      linkTags.forEach((link) => { link.remove(); });

      const body = clonedElement.textContent?.trim() || "";

      const links: string[] = [];
      const anchorLinks = clonedElement.querySelectorAll('a[href]');
      anchorLinks.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          links.push(href);
        }
      });

      let senderEmail = "";
      const senderElement = document.querySelector('[data-email]');
      if (senderElement) {
        senderEmail = senderElement.getAttribute('data-email') || "";
      }
      if (!senderEmail) {
        const fromElements = document.querySelectorAll('[name="from"]');
        for (const el of fromElements) {
          const value = el.getAttribute('value');
          if (value && value.includes('@')) {
            senderEmail = value;
            break;
          }
        }
      }
      if (!senderEmail) {
        const fromDivs = document.querySelectorAll('div[dir="ltr"]');
        for (const div of fromDivs) {
          const text = div.textContent || "";
          const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            senderEmail = emailMatch[0];
            break;
          }
        }
      }

      let subject = "";
      const subjectElement = document.querySelector('[data-subject]');
      if (subjectElement) {
        subject = subjectElement.getAttribute('data-subject') || "";
      }
      if (!subject) {
        const h1 = document.querySelector('h1');
        if (h1) subject = h1.textContent || "";
      }
      if (!subject) {
        const title = document.querySelector('title');
        if (title) subject = title.textContent || "";
      }

      return {
        senderEmail,
        subject,
        body,
        links,
      };
    } catch (error) {
      console.error('Error extracting email:', error);
      return null;
    }
  }

  // Function to request opening the side panel
  function requestOpenSidePanel() {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  }

  // Attach listeners to Gmail's email rows to try to open the panel on click
  function attachClickListeners() {
    // Gmail email rows usually have the class 'zA'
    const rows = document.querySelectorAll('.zA:not(.trustinbox-listener-attached)');
    rows.forEach(row => {
      row.classList.add('trustinbox-listener-attached');
      row.addEventListener('click', () => {
        // Since this click is a user gesture, we can request opening the side panel
        // Wait a bit for Gmail to actually load the email view
        setTimeout(requestOpenSidePanel, 500);
      }, { capture: true });
    });
  }

  // Check if we are on Gmail and attach listeners
  function checkGmailAndInit() {
    if (window.location.hostname.includes('mail.google.com')) {
      attachClickListeners();
    }
  }

  // Initial check
  checkGmailAndInit();

  // Watch for changes (Gmail is an SPA)
  const observer = new MutationObserver(() => {
    checkGmailAndInit();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
