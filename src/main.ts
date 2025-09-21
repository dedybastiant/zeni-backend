import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from './common/services';
import { globalValidationPipe } from './common/pipes/validation.pipes';
import { GlobalExceptionFilter } from './common/filters/global-exception.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(globalValidationPipe);

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
