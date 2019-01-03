import apiRoutes, {Route} from "../../common/api";

async function fetchBackend<T>(route: Route<T>, signal: AbortSignal) : Promise<T> {
  const response = await fetch(route.path, {
    signal
  });
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body as T;
}

export async function getIngredients(signal: AbortSignal) {
  return fetchBackend(apiRoutes.get.ingredients, signal);
}