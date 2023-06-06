import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SocketIoTypes } from './types/socket.io.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Voting Backend Api')
    .setDescription('Voting Backend Api with NestJs, Redis, Swagger and Docker')
    .setVersion('1.0')
    .build();
  app.useWebSocketAdapter(new SocketIoTypes(app));
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.APP_PORT);
}
bootstrap();
