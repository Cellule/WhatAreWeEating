import express from "express";
import apiRoutes, { Route } from "../client/src/common/api"
import Ingredient from "./Schema/Ingredient";
import Recipe from "./Schema/Recipe";
import { Model, Document } from "mongoose";
import { TypedModel } from "./Schema/utils";

export const ApiRoutes = apiRoutes;

async function findAndReply<ModelType extends Document & QueryResponse, QueryResponse>(
  res: express.Response,
  model: TypedModel<QueryResponse, ModelType>,
  route: Route<QueryResponse[]>,
  condition?: any,
) {
  const query: QueryResponse[] = await model.find(condition);
  res.send(query);
}

async function findOneAndReply<ModelType extends Document & QueryResponse, QueryResponse>(
  res: express.Response,
  model: TypedModel<QueryResponse, ModelType>,
  route: Route<QueryResponse>,
  condition?: any,
) {
  const query: QueryResponse = await model.findOne(condition);
  if (query === null) {
    return res.sendStatus(404);
  }
  res.send(query);
}

const handlers: {
  [method: string]: {[path: string]: express.RequestHandler},
} = {
  get: {
    ingredient: (req, res) => findOneAndReply(res, Ingredient, apiRoutes.get.ingredient, {name: req.params.name}),
    ingredients: (req, res) => findAndReply(res, Ingredient, apiRoutes.get.ingredients),
    recipe: (req, res) => findOneAndReply(res, Recipe, apiRoutes.get.recipe, {name: req.params.name}),
    recipes: (req, res) => findAndReply(res, Recipe, apiRoutes.get.recipes),
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
      const routeDef: Route<any, any> = apiRoutes[method][route];
      app[method](routeDef.urlFormat, handler);
    }
  }
}
