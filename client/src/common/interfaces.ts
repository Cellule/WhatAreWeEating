export interface IIngredient {
  name: string;
}

export interface IRecipe {
  name: string;
  source?: string;
  ingredients: IIngredient[];
}