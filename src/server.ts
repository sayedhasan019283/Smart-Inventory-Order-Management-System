/* instrumentation.mjs */
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'IOMS-service',
  }),

  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-dns': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
      '@opentelemetry/instrumentation-mongodb': { enabled: true },
    }),
  ],

  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
})

sdk.start()

import colors from 'colors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app';
import config from './config';
import { errorLogger, logger } from './shared/logger';
import { socketHelper } from './app/socket/socket';



process.on('uncaughtException', error => {
  errorLogger.error('Unhandled Exception Detected', error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    mongoose.connect(config.mongoose.url as string);
    logger.info(colors.green('🚀 Database connected successfully'));
    
    const port = typeof config.port === 'number' ? config.port : Number(config.port);
    // '0.0.0.0'
    server = app.listen(port, '0.0.0.0', () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port http://'0.0.0.0':${port}/test`)
      );
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    socketHelper.socket(io);
    // @ts-ignore
    global.io = io;

  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect Database'));
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('UnhandledRejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

process.on('SIGTERM', () => {
  logger.info('SIGTERM IS RECEIVE');
  if (server) {
    server.close();
  }
});