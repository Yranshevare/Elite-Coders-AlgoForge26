/**
 * Development entry point for content script.
 * Gmail email extractor - extracts complete sender, subject, and content
 */

(() => {
  // Function to extract complete email details
  function extractEmailDetails() {
    try {
      // Try to find the main email content container
      // Gmail typically uses these selectors for email content
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

      // If no specific email element found, fall back to body
      if (!emailElement) {
        emailElement = document.body;
      }

      // Clone the element to avoid modifying the original
      const clonedElement = emailElement.cloneNode(true) as Element;

      // Remove all <style> tags
      const styles = clonedElement.querySelectorAll('style');
      styles.forEach(style => style.remove());

      // Remove all <script> tags
      const scripts = clonedElement.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      // Remove all <link> tags with rel="stylesheet"
      const links = clonedElement.querySelectorAll('link[rel="stylesheet"]');
      links.forEach(link => link.remove());

      // Get the clean HTML of the email element
      const cleanHTML = clonedElement.outerHTML;

      // Print the clean HTML
      console.log('📧 Email HTML Element:', cleanHTML);
      return cleanHTML;
    } catch (error) {
      console.error('Error extracting HTML:', error);
      return null;
    }
  }

  // Listen for messages from the sidebar - ONLY extract when button is clicked
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'extractEmailDetails') {
      const result = extractEmailDetails();
      sendResponse({ success: !!result, data: result });
    }
  });
})();
