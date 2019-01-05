import chai from 'chai';
import chaiHttp from "chai-http";
import 'mocha';
import Ingredient, { IIngredientModel } from "./Schema/Ingredient";
import { ApiRoutes } from "./api"
import { setupServer, cleanup, ExpressApplication } from "./test.utils"
import { IIngredient } from '../client/src/common/interfaces';

chai.should();
chai.use(chaiHttp);

let server: ExpressApplication;
before(async () => {
  server = await setupServer();
});
after(cleanup);

describe('Ingredients', () => {
  const initalData = [
    new Ingredient({name: "tomato"}),
  ];
  function compareIngredients(models: IIngredientModel[], ingredients: IIngredient[]) {
    ingredients.should.be.a('array');
    ingredients.length.should.be.eql(initalData.length);
    for (let i = 0; i < models.length; ++i) {
      models[i].isEqual(ingredients[i]).should.be.true;
    }
  }
  beforeEach(async () => {
    await Ingredient.deleteMany({});
    for (const init of initalData) {
      init.save();
    }
  });

  describe('/GET ingredients', () => {
    it('it should GET all the ingredients', async () => {
      const res = await chai.request(server)
        .get(ApiRoutes.get.ingredients.getUrl());
      res.should.have.status(200);
      const ingredients = res.body as typeof ApiRoutes.get.ingredients.responseType;
      compareIngredients(initalData, ingredients);
    });
  });
});