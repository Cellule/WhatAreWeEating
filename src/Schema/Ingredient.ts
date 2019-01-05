import { Document, Schema, model} from "mongoose";
import { IIngredient } from "../../client/src/common/interfaces";

export interface IIngredientModel extends IIngredient, Document {
  isEqual(value: IIngredient): boolean;
}

export const IngredientSchema = new Schema({
  name: {type: String, required: true, unique: true}
}, {
  timestamps: true
});
IngredientSchema.methods.isEqual = function(value: IIngredient): boolean {
  return this.name === value.name;
};

export default model<IIngredientModel>("Ingredient", IngredientSchema);