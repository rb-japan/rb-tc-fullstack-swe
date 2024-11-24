import logger from 'jet-logger';

import EnvVars from '@src/common/EnvVars';
import httpServer from './server';

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.Port.toString());

httpServer.listen(EnvVars.Port, () => logger.info(SERVER_START_MSG));
