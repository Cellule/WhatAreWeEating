import express from "express";
import apiRoutes from "../common/api"

const handlers: {
  get: {[path: string]: express.RequestHandler},
  post: {[path: string]: express.RequestHandler},
} = {
  get: {
    ingredients(req, res) {
      const ingredients: typeof apiRoutes.get.ingredients.type = {
        ingredients: [{
          name: "tomate"
        }]
      };
      res.send(ingredients)
    }
  },
  post: {}
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
