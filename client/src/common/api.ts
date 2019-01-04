import {IIngredient} from "./interfaces";

export class Route<Response, Params = {}> {
  name: string;
  method: string;
  urlFormat: string;
  extraPath: string[];

  constructor(
    method: string,
    name: string,
    extraPath: string[] = []
  ) {
    this.name = name;
    this.method = method;
    this.extraPath = extraPath;
    const paths: string[] = [
      "api",
      method,
      name,
      ...extraPath
    ];
    this.urlFormat = `/${paths.join("/")}`;
    this.paramsType = {} as Params;
    this.responseType = {} as Response;
  }

  getUrl(params?: Params) {
    if (this.extraPath.length === 0) {
      // Without extra path, the format is the url
      return this.urlFormat;
    }

    const paths: string[] = [
      "api",
      this.method,
      this.name,
      ...(this.extraPath.map(p => {
        if (p.startsWith(":")) {
          const key = p.substr(1);
          if (!params || !(key in params)) {
            throw new Error(`Missing param ${key} to construct url ${this.urlFormat}`);
          }
          const value = params[key];
          return encodeURIComponent(String(value));
        }
        return p;
      }))
    ];
    return `/${paths.join("/")}`;
  }

  // Params and Response Types
  paramsType: Params;
  responseType: Response;
}

const apiRoutes = {
  get: {
    ingredient: new Route<{ingredient: IIngredient}, {name: string}>("get", "ingredient", [":name"]),
    ingredients: new Route<{ingredients: IIngredient[]}>("get", "ingredients"),
  },
}

export default apiRoutes;