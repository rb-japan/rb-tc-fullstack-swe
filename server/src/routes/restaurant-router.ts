import { Router } from 'express';
import { PartyController } from '@src/controllers/party';
import Paths from '@src/common/Paths';

const router = Router();
const partyController = new PartyController();

router.post(Paths.Restaurant.Join, partyController.join);

export default router;
