import { Router } from 'express';
import { PartyController } from '@src/controllers/party';
import Paths from '@src/common/Paths';

const router = Router();
const partyController = new PartyController();

router.post(Paths.Restaurant.Join, partyController.join);
router.post(Paths.Restaurant.CheckIn, partyController.checkIn);
router.get(Paths.Restaurant.Status, partyController.getStatus);

export default router;
