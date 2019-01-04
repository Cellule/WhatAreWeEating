import { Document, Schema, model} from "mongoose";
import { IIngredient } from "../../client/src/common/interfaces";

export interface IIngredientModel extends IIngredient, Document {
  // mongoose methods
  //fullName(): string;
}

export const IngredientSchema = new Schema({
  name: {type: String, required: true, unique: true}
}, {
  timestamps: true
});
// IngredientSchema.methods.fullName = function(): string {
//   return (this.firstName.trim() + " " + this.lastName.trim());
// };

export default model<IIngredientModel>("Ingredient", IngredientSchema);