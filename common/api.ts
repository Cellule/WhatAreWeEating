import {IIngredient} from "./interfaces";

interface Ingredients {
  ingredients: IIngredient[];
}

export interface Route<T> {
  name: string;
  method: string;
  path: string;
  type: T;
}

const apiRoutes = {
  get: {
    ingredients: {} as Route<Ingredients>,
  },
}

for (const method in apiRoutes) {
  const routes = apiRoutes[method];
  for (const route in routes) {
    routes[route].name = route;
    routes[route].method = method;
    routes[route].path = `/api/${method}/${route}`;
  }
}

export default apiRoutes;