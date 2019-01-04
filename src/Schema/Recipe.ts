import { Document, Schema, model} from "mongoose";
import { IRecipe } from "../../client/src/common/interfaces";

export interface IRecipeModel extends IRecipe, Document {
}

export const RecipeSchema = new Schema({
  name: {type: String, required: true, unique: true},
  source: String,
  ingredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }]
}, {
  timestamps: true
});

export default model<IRecipeModel>("Recipe", RecipeSchema);