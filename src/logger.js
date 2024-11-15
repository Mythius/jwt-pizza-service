const config = require("./config").logging;

exports.httpLogger = function (req,res,next) {
  let data = {
    platform: getPlatform(req),
    method: req.method,
    endpoint: req.url,
    isAuth: req.headers.authorization ? true : false,
    body: req.body ? req.body : undefined,
  };
  l.log('info','http',data);
  next();
};

exports.log = function (level,type,obj){
    l.log(level,type,obj);
}

function getPlatform(req) {
  const userAgent = req.headers["user-agent"];
  let platform = "unknown";

  if (userAgent.includes("Windows")) {
    platform = "windows";
  } else if (userAgent.includes("Macintosh")) {
    platform = "mac os";
  } else if (userAgent.includes("Linux")) {
    platform = "linux";
  } else if (userAgent.includes("iPhone")) {
    platform = "ios";
  } else if (userAgent.includes("Android")) {
    platform = "android";
  } else {
    platform = userAgent.replace(/\/.+/, "").toLowerCase();
  }
  return platform;
}

class Logger {
  log(level, type, logData) {
    const labels = { component: config.source, level: level, type: type };
    const values = [this.nowString(), this.sanitize(logData)];
    const logEvent = { streams: [{ stream: labels, values: [values] }] };

    this.sendLogToGrafana(logEvent);
  }

  statusToLogLevel(statusCode) {
    if (statusCode >= 500) return "error";
    if (statusCode >= 400) return "warn";
    return "info";
  }

  nowString() {
    return (Math.floor(Date.now()) * 1000000).toString();
  }

  sanitize(logData) {
    logData = JSON.stringify(logData);
    return logData.replace(
      /"password":\s*"[^"]*"/g,
      '"password": "*****"'
    );
  }

  sendLogToGrafana(event) {
    const body = JSON.stringify(event);
    fetch(`${config.url}`, {
      method: "post",
      body: body,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.userId}:${config.apiKey}`,
      },
    }).then((res) => {
      if (!res.ok) console.log("Failed to send log to Grafana");
    });
  }
}


let l = new Logger();