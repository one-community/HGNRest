const Sentry = require('@sentry/node');
const { extraErrorDataIntegration } = require('@sentry/integrations');

// Read more about intergration plugins here: https://docs.sentry.io/platforms/node/configuration/integrations/pluggable-integrations/
exports.init = function () {
  Sentry.init({
    dsn: process.env.SentryDSN_URL,
    environment: process.env.NODE_ENV ? process.env.NODE_ENV : 'local',
    beforeSend(event) {
      // Modify or drop the event here
      if (event.modules) {
        // Don't send a list of modules with the event
        delete event.modules;
      }
      return event;
    },
    // release: process.env.releaseVersion, // Replace with application version
    integrations: [
      // Default Integrations
      // Sentry.httpIntegration({
      //   tracing: true, // defaults to false
      // }),
      // Sentry.localVariablesIntegration({
      //   captureAllExceptions: true,
      // }),
      Sentry.requestDataIntegration({
        include: {
          cookies: false, // default: true,
          data: true, // default: true,
          headers: false, // default: true,
          ip: false, // default: false,
          query_string: true, // default: true,
          url: true, // default: true,
          user: false,
        },
      }),
      // Pluggable Integrations
      extraErrorDataIntegration({
        depth: 3,
      }),

    ],
    // Utilize the following options for debugging. Comment out by default.
    // enableTracing: true,
    // tracesSampleRate: 1.0, // 1.0 means 100% of transactions will be sent to Sentry
    // debug: true,
  });
};

exports.logInfo = function (message) {
  if (process.env.NODE_ENV === 'local' || !process.env.NODE_ENV) {
    // Do not log to Sentry in local environment
    console.log(message);
  } else {
    Sentry.captureMessage(message, { level: 'info' });
  }
};

/**
 *
 * @param {Error} error error object to be logged to Sentry
 * @param {String} transactionName name assigned to a transaction
 * @param {*} extraData any extra data to be logged to Sentry
 */
exports.logException = function (error, transactionName = null, extraData = null) {
  if (process.env.NODE_ENV === 'local' || !process.env.NODE_ENV) {
    // Do not log to Sentry in local environment
    console.error(error);
    Sentry.captureException(error, (scope) => {
      if (transactionName !== null) {
        scope.setTransactionName(transactionName);
      }
      if (extraData !== null) {
        scope.setExtra('extraData', extraData);
      }
      return scope;
    });
  } else {
    Sentry.captureException(error, (scope) => {
      if (transactionName !== null) {
        scope.setTransactionName(transactionName);
      }
      if (extraData !== null) {
        scope.setExtra('extraData', extraData);
      }
      return scope;
    });
  }
};
