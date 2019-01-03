import express from "express";
import apiRoutes from "../client/src/common/api"
import Ingredient from "./Schema/Ingredient";

const handlers: {
  [method: string]: {[path: string]: express.RequestHandler},
} = {
  get: {
    async ingredients(req, res) {
      const ingredients = await Ingredient.find();
      const response: typeof apiRoutes.get.ingredients.type = {
        ingredients
      };
      res.send(response)
    }
  },
  post: {}
}

// Sanity checks
for (const method in apiRoutes) {
  for (const route in apiRoutes[method]) {
    if (!handlers[method] || !handlers[method][route]) {
      throw new Error(`Missing api handler for route ${method}.${route}`);
    }
  }
}
for (const method in handlers) {
  for (const route in handlers[method]) {
    if (!apiRoutes[method] || !apiRoutes[method][route]) {
      throw new Error(`Missing api route for handler ${method}.${route}`);
    }
  }
}

export function attachApiRoutes(app: express.Express) {
  for (const method in handlers) {
    for (const route in handlers[method]) {
      const handler = handlers[method][route];
      const routeDef = apiRoutes[method][route];
      app[method](routeDef.path, handler);
    }
  }
}
