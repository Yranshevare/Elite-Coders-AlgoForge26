import Browser from 'webextension-polyfill';

Browser.runtime.onInstalled.addListener(() => {
  console.log('Welcome to chrome ext starter. have a nice day!');
});

Browser.action.onClicked.addListener((tab) => {
  //@ts-expect-error
  Browser.sidePanel.open({ tabId: tab.id });
});
