import apiRoutes, {Route} from "./common/api";

async function fetchBackend<Response, Params>(
  route: Route<Response, Params>,
  signal: AbortSignal,
  params?: Params
) : Promise<Response> {
  const response = await fetch(route.getUrl(params), {
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
  return tryBody as Response;
}

export async function getIngredient(signal: AbortSignal, params: typeof apiRoutes.get.ingredient.paramsType) {
  return fetchBackend(apiRoutes.get.ingredient, signal, params);
}

export async function getIngredients(signal: AbortSignal) {
  return fetchBackend(apiRoutes.get.ingredients, signal);
}