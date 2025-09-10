import express from 'express';
import type { Request, Response, NextFunction, RequestHandler, Router } from 'express';
import { ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';

// Type for a single route definition
export interface RouteDefinition {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  handler: RequestHandler;
}

// Type for the routes config object
export type RoutesConfig = Record<string, RouteDefinition>;

/**
 * defineRoutes: Helper to define routes with schemas and handlers
 */
export function defineRoutes(routes: RoutesConfig): RoutesConfig {
  return routes;
}

/**
 * schemaRouter: Express middleware generator from schema-based routes
 */
export function schemaRouter(routes: RoutesConfig): Router {
  const router = express.Router();

  for (const routeKey in routes) {
    const [method, ...pathParts] = routeKey.split(' ');
    const path = pathParts.join(' ');
    const route = routes[routeKey];
    if (!route) continue;
    const { body, query, params, handler } = route;

    const validators: RequestHandler[] = [];

    if (body) {
      validators.push((req, res, next) => {
        const result = body.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid body', details: (result.error as any).issues });
        }
        req.body = result.data;
        next();
      });
    }
    if (query) {
      validators.push((req, res, next) => {
        const result = query.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid query', details: (result.error as any).issues });
        }
        res.locals.validatedQuery = result.data;
        next();
      });
    }
    if (params) {
      validators.push((req, res, next) => {
        const result = params.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({ error: 'Invalid params', details: (result.error as any).issues });
        }
        (req.params as any) = result.data;
        next();
      });
    }

    // @ts-ignore
    router[method.toLowerCase()](path, ...validators, handler);
  }

  // Error handler for Zod errors (optional, for catching thrown errors)
  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation error', details: (err as any).issues });
    }
    next(err);
  });

  // Catch-all error handler for debugging
  router.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({ error: 'Internal Server Error', message: err?.message, stack: err?.stack });
  });

  return router;
}
