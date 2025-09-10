import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { defineRoutes, schemaRouter } from '../src/index.js';

describe('express-schema-router', () => {
  const app = express();
  app.use(express.json());

  const routes = defineRoutes({
    'POST /users': {
      body: z.object({ name: z.string(), email: z.string().email() }),
      handler: (req: express.Request, res: express.Response) => {
        res.json({ user: req.body });
      },
    },
    'GET /search': {
      query: z.object({ q: z.string() }),
      handler: (req: express.Request, res: express.Response) => {
        res.json({ q: res.locals.validatedQuery.q });
      },
    },
    'GET /users/:id': {
      params: z.object({ id: z.string().regex(/^\d+$/) }),
      handler: (req: express.Request, res: express.Response) => {
        res.json({ id: req.params.id });
      },
    },
  });

  app.use(schemaRouter(routes));

  it('should create user with valid body', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'alice@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ name: 'Alice', email: 'alice@example.com' });
  });

  it('should reject invalid body', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Alice', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid body');
  });

  it('should handle query validation', async () => {
    const res = await request(app).get('/search?q=hello');
    expect(res.status).toBe(200);
    expect(res.body.q).toBe('hello');
  });

  it('should reject invalid query', async () => {
    const res = await request(app).get('/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid query');
  });

  it('should handle params validation', async () => {
    const res = await request(app).get('/users/123');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('123');
  });

  it('should reject invalid params', async () => {
    const res = await request(app).get('/users/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid params');
  });
});
