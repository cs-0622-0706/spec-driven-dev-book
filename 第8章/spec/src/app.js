(function () {
  var AUTH_KEY = "auth";
  var VALID_EMAIL = "demo@chapter8.local";
  var VALID_PASSWORD = "chapter8-demo";
  var LOGIN_ERROR_MSG = "入力が正しくありません";

  function isLoggedIn() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function login(email, password) {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch (e) {
        return { ok: false, message: LOGIN_ERROR_MSG };
      }
      return { ok: true };
    }
    return { ok: false, message: LOGIN_ERROR_MSG };
  }

  function logout() {
    try {
      sessionStorage.removeItem(AUTH_KEY);
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

  window.Chapter8Auth = {
    isLoggedIn: isLoggedIn,
    login: login,
    logout: logout,
    requireAuth: requireAuth,
    LOGIN_ERROR_MSG: LOGIN_ERROR_MSG,
  };
})();
