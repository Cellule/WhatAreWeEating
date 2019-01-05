import { model, Model, Document, Schema } from "mongoose";

export interface TypedModel<I, T extends Document> extends Model<T> {
  new(value: I): T;
  make(value: I): T;
}

export function makeModel<I, IModel extends Document>(
  name: string,
  schema: Schema
) {
  const mymodel = model<IModel>(name, schema);
  (mymodel as any).make = function (value: I) { return new this(value); };
  return mymodel as TypedModel<I, IModel>;
}
