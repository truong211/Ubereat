import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.text).toBe('Hello World!');
  });

  it('should return 404 for non-existent route', async () => {
    await request(app.getHttpServer()).get('/non-existent-route').expect(404);
  });

  it('should return valid response headers', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.headers['content-type']).toMatch(/text\/html/);
  });
});
