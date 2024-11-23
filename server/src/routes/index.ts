import { Router } from 'express';
import restaurantRouter from './restaurant-router';
import Paths from '@src/common/Paths';

const apiRouter = Router();
apiRouter.use(Paths.Restaurant.Base, restaurantRouter);

export default apiRouter;
