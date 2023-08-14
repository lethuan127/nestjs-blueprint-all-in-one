import apmAgent from 'elastic-apm-node';
import 'dotenv/config';

const options: apmAgent.AgentConfigOptions = {
  serviceName: 'nexg-api',
  serverUrl: process.env.APM_HOST,
  secretToken: process.env.APM_SECRET_TOKEN,
  captureBody: 'errors',
};

const apm: apmAgent.Agent = apmAgent.start(options);

apm.handleUncaughtExceptions((err) => {
  console.error('handleUncaughtExceptions', err);
});
export { apm };
