// src/hooks/useTracker.js
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const useTracker = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const partnerId = urlParams.get('ref');

  if (partnerId) {
    setCookie('medsinai_partner_ref', partnerId, 60);
  }
};

export default useTracker;
