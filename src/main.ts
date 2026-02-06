import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import { AllExceptionsFilter } from './core/configs/allexceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('v1/api');

  app.useGlobalFilters(new AllExceptionsFilter());

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://safeo.greny.app', 'https://www.safeo.greny.app']
        : '*',
    credentials: true,
  });
  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Safeo')
    .setDescription('API de la plateforme Safeo')
    .setVersion('1.0')
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            email: 'Email',
            profile: 'Profile',
            openid: 'OpenID',
          },
        },
      },
    })
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0', () => {
    console.log(
      `Server running on port http://localhost:${process.env.PORT ?? 3000}`,
    );
  });
}

void bootstrap();
