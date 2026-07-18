(function () {
  var AUTH_KEY = "sample8_auth";

  function isLoggedIn() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setLoggedIn(value) {
    try {
      if (value) {
        sessionStorage.setItem(AUTH_KEY, "1");
      } else {
        sessionStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function requireAuth(loginPath) {
    loginPath = loginPath || "index.html";
    if (!isLoggedIn()) {
      window.location.replace(loginPath);
      return false;
    }
    return true;
  }

  function redirectIfAuthed(targetPath) {
    targetPath = targetPath || "protected.html";
    if (isLoggedIn()) {
      window.location.replace(targetPath);
      return true;
    }
    return false;
  }

  window.Sample8Auth = {
    isLoggedIn: isLoggedIn,
    setLoggedIn: setLoggedIn,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
  };
})();
