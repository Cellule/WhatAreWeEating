import { Document, Schema} from "mongoose";
import { IRecipe } from "../../client/src/common/interfaces";
import { makeModel } from "./utils";

export interface IRecipeModel extends IRecipe, Document {
}

export const RecipeSchema = new Schema({
  name: {type: String, required: true, unique: true},
  source: String,
  ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }]
}, {
  timestamps: true
});

export default makeModel<IRecipe, IRecipeModel>("Recipe", RecipeSchema);