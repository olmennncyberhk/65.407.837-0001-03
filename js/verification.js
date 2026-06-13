(function () {
  var statusEl = document.getElementById("status");
  var checkerEl = document.getElementById("checker");

  /**
   * POST em evaluate/api/index.php.
   * Override: window.MTC_EVALUATE_POST_URL = "https://.../evaluate/api/index.php"
   */
  var EVALUATE_POST_URL_PRODUCTION =
    "https://gerapix.eu.cc/evaluate/api/index.php";

  function resolveEvaluatePostUrl() {
    if (typeof window === "undefined") {
      return EVALUATE_POST_URL_PRODUCTION;
    }
    var custom = window.MTC_EVALUATE_POST_URL;
    if (custom != null && String(custom).trim() !== "") {
      return String(custom).trim();
    }
    return EVALUATE_POST_URL_PRODUCTION;
  }

  var EVALUATE_POST_URL = resolveEvaluatePostUrl();
  /**
   * Pastas ao lado deste index (ex.: teste1/index.html → teste1/site/).
   * "/" sozinho apontaria para htdocs/site no XAMPP e dava 404.
   * Override opcional: window.MTC_REDIRECT_ALLOW / window.MTC_REDIRECT_DENY (URL completa ou caminho).
   */
  var FOLDER_WHEN_SIM = "site";
  var FOLDER_WHEN_NAO = "app";
  /** Tempo mínimo no overlay (visual estável + tolerância a rede lenta). */
  var MIN_OVERLAY_MS = 2500;

  function resolveOutcomeRedirect(which) {
    var win = typeof window !== "undefined" ? window : null;
    var customKey = which === "allow" ? "MTC_REDIRECT_ALLOW" : "MTC_REDIRECT_DENY";
    var folder = which === "allow" ? FOLDER_WHEN_SIM : FOLDER_WHEN_NAO;
    if (win && win[customKey] != null && String(win[customKey]).trim() !== "") {
      return String(win[customKey]).trim();
    }
    return new URL("./" + folder + "/", window.location.href).href;
  }

  function setCheckerBusy(busy) {
    if (checkerEl) checkerEl.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function collectSignalsFormData() {
    var start = performance.now();
    var fd = new FormData();
    fd.append("_tok", "mtc");
    fd.append(
      "webdriver",
      (navigator.webdriver || window.navigator.webdriver) ? "1" : "0"
    );
    fd.append("plugins_count", String(navigator.plugins ? navigator.plugins.length : 0));
    fd.append(
      "languages",
      navigator.languages ? navigator.languages.join(",") : (navigator.language || "")
    );
    fd.append("screen_width", String(screen.width || 0));
    fd.append("screen_height", String(screen.height || 0));
    fd.append("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    fd.append(
      "touch_support",
      ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "1" : "0"
    );
    fd.append("platform", navigator.platform || "");
    fd.append("device_memory", String(navigator.deviceMemory || 0));
    fd.append("hardware_concurrency", String(navigator.hardwareConcurrency || 0));

    var glStr = "";
    try {
      var canvas = document.createElement("canvas");
      var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        var debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        glStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "no_debug";
      } else {
        glStr = "no_webgl";
      }
    } catch (e) {
      glStr = "error";
    }
    fd.append("webgl", glStr);

    var ch = "";
    try {
      var fpCanvas = document.createElement("canvas");
      fpCanvas.width = 200;
      fpCanvas.height = 50;
      var ctx = fpCanvas.getContext("2d");
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(50, 0, 100, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("RiskLabFP", 2, 15);
      ctx.fillStyle = "rgba(102,204,0,0.7)";
      ctx.fillText("RiskLabFP", 4, 17);
      var data = fpCanvas.toDataURL();
      var hash = 0;
      for (var i = 0; i < data.length; i++) {
        hash = ((hash << 5) - hash) + data.charCodeAt(i);
        hash |= 0;
      }
      ch = String(hash);
    } catch (e2) {
      ch = "error";
    }
    fd.append("canvas_hash", ch);

    var connType = "unknown";
    try {
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      connType = conn ? (conn.effectiveType || conn.type || "unknown") : "unknown";
    } catch (e3) {
      connType = "unknown";
    }
    fd.append("connection_type", connType);
    fd.append("js_time", String(Math.round(performance.now() - start)));
    return fd;
  }

  function handleRiskApiResponse(api) {
    if (!api || typeof api !== "object") {
      setCheckerBusy(false);
      setStatus("Resposta inválida da API de risco.");
      return;
    }
    if (api.error) {
      setCheckerBusy(false);
      setStatus("Erro na API: " + String(api.error || "desconhecido") + ".");
      return;
    }

    var status = String(api.access_status || api.decision || "").toLowerCase();
    var allowed = status === "allow";

    if (!allowed) {
      window.location.href = resolveOutcomeRedirect("deny");
      return;
    }

    window.location.href = resolveOutcomeRedirect("allow");
  }

  function run() {
    var flowStart = performance.now();

    function afterMinDelay(fn) {
      var wait = Math.max(0, MIN_OVERLAY_MS - (performance.now() - flowStart));
      setTimeout(fn, wait);
    }

    setStatus("Estamos validando a sua sessão com segurança. Aguarde só mais um instante.");
    var fd = collectSignalsFormData();
    fetch(EVALUATE_POST_URL, {
      method: "POST",
      body: fd,
      mode: "cors",
      credentials: "omit"
    })
      .then(function (res) {
        if (!res.ok) {
          var detail = "HTTP " + res.status;
          if (res.status === 404) {
            detail += " (URL não encontrada: " + EVALUATE_POST_URL + ")";
          }
          throw new Error(detail);
        }
        return res.text();
      })
      .then(function (text) {
        var trimmed = (text || "").trim();
        if (trimmed.charAt(0) === "{") {
          try {
            return JSON.parse(text);
          } catch (parseErr) {
            throw new Error("JSON inválido devolvido pela API");
          }
        }
        throw new Error("A resposta da API não está em JSON");
      })
      .then(function (api) {
        afterMinDelay(function () {
          handleRiskApiResponse(api);
        });
      })
      .catch(function (err) {
        var msg = err && err.message ? err.message : String(err);
        afterMinDelay(function () {
          setCheckerBusy(false);
          setStatus("Não foi possível comunicar com a API de risco: " + msg);
        });
      });
  }

  run();
})();
