/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { JSX, useEffect } from 'react';

import Browser from 'webextension-polyfill';

export default function Content(): JSX.Element {
  useEffect(() => {
    // Hardcoded websites to show sidePanel indicator
    const autoOpenWebsites = ['gmail.com', 'mail.google.com'];

    if (autoOpenWebsites.some(domain => window.location.hostname.includes(domain))) {
      Browser.runtime.sendMessage({ action: 'showSidePanelIndicator' });
    }
  }, []);

  // No UI needed for content script - just URL checking
  return <></>;
}
