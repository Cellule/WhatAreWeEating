import {Ingredients} from "../../common/api-interface"

export async function getIngredients() {
  const response = await fetch('/api/ingredients');
  const body = await response.json();
  if (response.status !== 200) throw Error(body.message);
  return body as Ingredients;
}