import {Ingredients} from "../common/api-interface"
import express from "express";

interface RouteDefinition {
  route: string;
  handler: express.RequestHandler
}

const apiRoutes: {
  get: RouteDefinition[],
  post: RouteDefinition[],
} = {
  get: [{
    route: "ingredients",
    handler(req, res) {
      const ingredients: Ingredients = {
        ingredients: [{
          name: "tomate"
        }]
      };
      res.send(ingredients);
    }
  }],
  post: []
}

export function attachApiRoutes(app: express.Express) {
  for (const route of apiRoutes.get) {
    app.get("/api/" + route.route, route.handler);
  }
  for (const route of apiRoutes.post) {
    app.post("/api/" + route.route, route.handler);
  }
}
