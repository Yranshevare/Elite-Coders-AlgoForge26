// Gmail email extractor and side panel trigger
(() => {
  let lastUrl = window.location.href;

  function isEmailView() {
    const hash = window.location.hash;
    // Gmail email IDs are usually 16-character hex strings or similar
    // We check for patterns like #inbox/..., #sent/..., #label/...
    const pathParts = hash.split('/');
    if (pathParts.length >= 2) {
      const id = pathParts[pathParts.length - 1];
      return /^[a-f0-9]{16}$/.test(id) || id.length >= 16;
    }
    return hash.includes('?compose=');
  }

  function extractEmailDetails() {
    try {
      let subject = "";
      const subjectSelectors = ['h2.hP', '[data-subject]', 'h1'];
      for (const sel of subjectSelectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent?.trim()) {
          const text = el.textContent.trim();
          if (text.toLowerCase().includes('search') && text.toLowerCase().includes('gemini')) continue;
          subject = text;
          break;
        }
      }

      let senderEmail = "";
      const senderSelectors = ['span[email]', '[data-hovercard-id]', '[data-email]', 'span.gD'];
      for (const sel of senderSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          senderEmail = el.getAttribute('email') || el.getAttribute('data-hovercard-id') || el.getAttribute('data-email') || "";
          if (senderEmail && senderEmail.includes('@')) break;
          const match = (el.textContent || "").match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (match) { senderEmail = match[0]; break; }
        }
      }

      const emailSelectors = ['[data-message-id] [role="presentation"]', '.a3s.aiL', '[role="main"] [role="article"]'];
      let emailElement = null;
      for (const selector of emailSelectors) {
        emailElement = document.querySelector(selector);
        if (emailElement && emailElement.textContent?.trim()) break;
      }
      if (!emailElement) emailElement = document.body;

      const clonedElement = emailElement.cloneNode(true) as Element;
      clonedElement.querySelectorAll('style, script, link').forEach(el => el.remove());

      const body = clonedElement.textContent?.trim() || "";
      const links: string[] = [];
      clonedElement.querySelectorAll('a[href]').forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          links.push(href);
        }
      });

      return { senderEmail, subject, body, links };
    } catch (error) {
      console.error('Error extracting email:', error);
      return null;
    }
  }

  function checkNavigation() {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;

    if (!isEmailView()) {
      chrome.runtime.sendMessage({ action: 'navigatedToInbox' });
    } else {
      chrome.runtime.sendMessage({ action: 'navigatedToEmail' });
    }
  }

  function requestOpenSidePanel() {
    // Only request open if we are actually in an email view
    if (isEmailView()) {
      chrome.runtime.sendMessage({ action: 'openSidePanel' });
    }
  }

  function attachClickListeners() {
    const rows = document.querySelectorAll('.zA:not(.trustinbox-listener-attached)');
    rows.forEach(row => {
      row.classList.add('trustinbox-listener-attached');
      row.addEventListener('click', () => {
        // Delay to allow URL to update before checking
        setTimeout(() => {
          if (isEmailView()) {
            requestOpenSidePanel();
          }
        }, 500);
      }, { capture: true });
    });
  }

  function init() {
    if (window.location.hostname.includes('mail.google.com')) {
      attachClickListeners();
      checkNavigation();
    }
  }

  init();
  const observer = new MutationObserver(() => init());
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('hashchange', checkNavigation);
  window.addEventListener('popstate', checkNavigation);

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
