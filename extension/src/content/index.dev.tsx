// Development entry point for content script
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

  // Inject a button to open the side panel
  function injectSidePanelTrigger() {
    if (document.getElementById('trustinbox-trigger')) return;

    const btn = document.createElement('div');
    btn.id = 'trustinbox-trigger';
    btn.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: #7c3aed;
        color: white;
        padding: 10px 16px;
        border-radius: 50px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 600;
        transition: transform 0.2s, background 0.2s;
      " onmouseover="this.style.transform='scale(1.05)';this.style.background='#6d28d9'"
         onmouseout="this.style.transform='scale(1)';this.style.background='#7c3aed'">
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="stroke-width: 2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Analyze Email
      </div>
    `;

    btn.onclick = (e) => {
      e.stopPropagation();
      requestOpenSidePanel();
    };

    document.body.appendChild(btn);
  }

  // Attach listeners to Gmail's email rows
  function attachClickListeners() {
    const rows = document.querySelectorAll('.zA:not(.trustinbox-listener-attached)');
    rows.forEach(row => {
      row.classList.add('trustinbox-listener-attached');
      row.addEventListener('click', () => {
        setTimeout(requestOpenSidePanel, 500);
      }, { capture: true });
    });
  }

  // Check if we are on Gmail and show the trigger
  function checkGmailAndInject() {
    if (window.location.hostname.includes('mail.google.com')) {
      injectSidePanelTrigger();
      attachClickListeners();
    }
  }

  // Initial check
  checkGmailAndInject();

  // Watch for changes
  const observer = new MutationObserver(() => {
    checkGmailAndInject();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
