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
  const initalData = () => [
    Ingredient.make({name: "Tomato"}),
    Ingredient.make({name: "Carrot"}),
    Ingredient.make({name: "Ketchup"}),
  ];
  function compareIngredients(models: IIngredientModel[], ingredients: IIngredient[]) {
    ingredients.should.be.a('array');
    ingredients.length.should.be.eql(models.length);
    for (let i = 0; i < models.length; ++i) {
      models[i].isEqual(ingredients[i]).should.be.true;
    }
  }
  beforeEach(async () => {
    await Ingredient.deleteMany({});
    await Promise.all(initalData().map(init => init.save()));
  });

  describe('/GET ingredients', () => {
    it('it should GET all the ingredients', async () => {
      const res = await chai.request(server)
        .get(ApiRoutes.get.ingredients.getUrl(null));
      res.should.have.status(200);
      const ingredients = res.body as typeof ApiRoutes.get.ingredients.responseType;
      compareIngredients(initalData(), ingredients);
    });
  });

  describe('/GET ingredient', () => {
    it('it should GET the specified ingredient', async () => {
      for (const init of initalData()) {
        const res = await chai.request(server)
         .get(ApiRoutes.get.ingredient.getUrl({name: init.name}));
        res.should.have.status(200);
        const ingredient = res.body as typeof ApiRoutes.get.ingredient.responseType;
        init.isEqual(ingredient).should.be.true;
      }
    });
  });
});