(function(){(()=>{function p(){var t,r;try{const c=['[data-message-id] [role="presentation"]',".a3s.aiL",'[role="main"] [role="article"]',"[data-message-id]",".gs",'[itemprop="description"]'];let o=null;for(const e of c)if(o=document.querySelector(e),o&&((t=o.textContent)!=null&&t.trim()))break;o||(o=document.body);const l=o.cloneNode(!0);l.querySelectorAll("style").forEach(e=>{e.remove()}),l.querySelectorAll("script").forEach(e=>{e.remove()}),l.querySelectorAll('link[rel="stylesheet"]').forEach(e=>{e.remove()});const x=((r=l.textContent)==null?void 0:r.trim())||"",m=[];l.querySelectorAll("a[href]").forEach(e=>{const n=e.getAttribute("href");n&&(n.startsWith("http://")||n.startsWith("https://"))&&m.push(n)});let s="";const f=document.querySelector("[data-email]");if(f&&(s=f.getAttribute("data-email")||""),!s){const e=document.querySelectorAll('[name="from"]');for(const n of e){const a=n.getAttribute("value");if(a&&a.includes("@")){s=a;break}}}if(!s){const e=document.querySelectorAll('div[dir="ltr"]');for(const n of e){const g=(n.textContent||"").match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);if(g){s=g[0];break}}}let i="";const h=document.querySelector("[data-subject]");if(h&&(i=h.getAttribute("data-subject")||""),!i){const e=document.querySelector("h1");e&&(i=e.textContent||"")}if(!i){const e=document.querySelector("title");e&&(i=e.textContent||"")}return{senderEmail:s,subject:i,body:x,links:m}}catch(c){return console.error("Error extracting email:",c),null}}function d(){chrome.runtime.sendMessage({action:"openSidePanel"})}function b(){if(document.getElementById("trustinbox-trigger"))return;const t=document.createElement("div");t.id="trustinbox-trigger",t.innerHTML=`
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
    `,t.onclick=r=>{r.stopPropagation(),d()},document.body.appendChild(t)}function y(){document.querySelectorAll(".zA:not(.trustinbox-listener-attached)").forEach(r=>{r.classList.add("trustinbox-listener-attached"),r.addEventListener("click",()=>{setTimeout(d,500)},{capture:!0})})}function u(){window.location.hostname.includes("mail.google.com")&&(b(),y())}u(),new MutationObserver(()=>{u()}).observe(document.body,{childList:!0,subtree:!0}),chrome.runtime.onMessage.addListener((t,r,c)=>{if(t.action==="extractEmailDetails"){const o=p();c({success:!!o,data:o})}})})();
})()
