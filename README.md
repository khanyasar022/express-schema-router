# express-schema-router

A schema-first router for Express.js that lets you define routes and validation in one place using Zod, reducing boilerplate and improving maintainability.

## Features
- Define routes, validation, and handlers in a single config
- Automatic request validation with Zod
- Minimal repetitive code

## Install
```sh
npm install express-schema-router express zod
```

## Usage
```ts
import express from 'express';
import { z } from 'zod';
import { defineRoutes, schemaRouter } from 'express-schema-router';

const routes = defineRoutes({
  'POST /users': {
    body: z.object({ name: z.string(), email: z.string().email() }),
    handler: (req, res) => {
      // req.body is validated
      res.json({ user: req.body });
    },
  },
  'GET /search': {
    query: z.object({ q: z.string() }),
    handler: (req, res) => {
      // Validated query is available as res.locals.validatedQuery
      res.json({ q: res.locals.validatedQuery.q });
    },
  },
});

const app = express();
app.use(express.json());
app.use(schemaRouter(routes));
app.listen(3000);
```

**Note:** For query validation, the validated data is available as `res.locals.validatedQuery` in your handler (not `req.query`), due to Express 5's getter-only property.

## License
MIT
