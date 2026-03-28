import Browser from 'webextension-polyfill';

Browser.runtime.onInstalled.addListener(() => {
  console.log('Welcome to chrome ext starter. have a nice day!');
});

Browser.action.onClicked.addListener((tab) => {
  //@ts-expect-error
  Browser.sidePanel.open({ tabId: tab.id });
});

// Listen for messages from content scripts
Browser.runtime.onMessage.addListener((message: any, sender: Browser.Runtime.MessageSender) => {
  console.log('Background received message:', message);
  if (message && message.action === 'openSidePanel') {
    const tabId = sender.tab?.id;
    console.log('Attempting to open side panel for tab:', tabId);
    if (tabId) {
      // Use chrome API directly as polyfill support for sidePanel varies
      chrome.sidePanel.open({ tabId }).catch((err) => {
        console.error('Error opening side panel:', err);
      });
    }
  }
});
