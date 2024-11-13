const os = require("os");
const config = require("./config.js").metrics;
const auth = require("./routes/authRouter.js");

class Metrics {
  constructor() {
    this.totalRequests = 0;

    this.requestsByType = { GET: 0, POST: 0, DELETE: 0, PUT:0 };

    // This will periodically sent metrics to Grafana
    const timer = setInterval(() => {
      this.sendMetricToGrafana("request", "all", "total", this.totalRequests);
      this.sendMetricToGrafana(
        "request",
        "GET",
        "GET",
        this.requestsByType.GET
      );
      this.sendMetricToGrafana(
        "request",
        "POST",
        "POST",
        this.requestsByType.POST
      );
      this.sendMetricToGrafana(
        "request",
        "DELETE",
        "DELETE",
        this.requestsByType.DELETE
      );
      this.sendMetricToGrafana(
        "request",
        "PUT",
        "PUT",
        this.requestsByType.PUT
      );
      this.sendMetricToGrafana(
        "cpu",
        "cpu_usage",
        "cpu_usage",
        getCpuUsagePercentage()
      );
      this.sendMetricToGrafana(
        "cpu",
        "mem_usage",
        "mem_usage",
        getMemoryUsagePercentage()
      );
      this.sendMetricToGrafana("auth","active_users","active_users",auth.active_users);
      this.sendMetricToGrafana("auth","fail_auth_attempts","fail_auth_attempts",auth.fail_auth_attempts);
      this.sendMetricToGrafana("auth","success_auth_attempts","success_auth_attempts",auth.success_auth_attempts);
    
      this.sendMetricToGrafana("indic","pizzas_sold","pizzas_sold",exports.data.pizzas_sold);
      this.sendMetricToGrafana("indic","revenue","revenue",exports.data.revenue);
      this.sendMetricToGrafana("indic","order_failure","order_failure",exports.data.order_failure);
      this.sendMetricToGrafana("latency","service_latency","service_latency",exports.data.service_latency);
      this.sendMetricToGrafana("latency","pizza_creation_latency","pizza_creation_latency",exports.data.pizza_creation_latency);
    
    }, 10000);
    timer.unref();
  }

  incramentType(type) {
    this.requestsByType[type]++;
    this.totalRequests++;
  }

  incrementRequests() {
    this.totalRequests++;
  }

  sendMetricToGrafana(metricPrefix, httpMethod, metricName, metricValue) {
    const metric = `${metricPrefix},source=${config.source},method=${httpMethod} ${metricName}=${metricValue}`;

    fetch(`${config.url}`, {
      method: "post",
      body: metric,
      headers: { Authorization: `Bearer ${config.userId}:${config.apiKey}` },
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Failed to push metrics data to Grafana");
          console.error(response);
        } else {
          console.log(`Pushed ${metric}`);
        }
      })
      .catch((error) => {
        console.error("Error pushing metrics:", error);
      });
  }
}

function getCpuUsagePercentage() {
  const cpuUsage = os.loadavg()[0] / os.cpus().length;
  return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = (usedMemory / totalMemory) * 100;
  return memoryUsage.toFixed(2);
}

const m = new Metrics();

function requestTracker(req, res, next) {
  m.incramentType(req.method);
  console.log(req.url);
  next();
}

exports.requestTracker = requestTracker;
exports.data = {order_failure:0,pizzas_sold:0,revenue:0,service_latency:0,pizza_creation_latency:0}
