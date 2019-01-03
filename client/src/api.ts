import apiRoutes, {Route} from "./common/api";

async function fetchBackend<T>(route: Route<T>, signal: AbortSignal) : Promise<T> {
  const response = await fetch(route.path, {
    signal
  });
  let tryBody: any = {
    message: response.statusText
  };
  try {
    tryBody = await response.json();
  } catch(e) {
    // If we had a valid response and failed to parse, throw
    if (response.status === 200) {
      throw e;
    }
  }

  if (response.status !== 200) {
    throw Error(tryBody.message);
  }
  return tryBody as T;
}

export async function getIngredients(signal: AbortSignal) {
  return fetchBackend(apiRoutes.get.ingredients, signal);
}