/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, RequestHandler } from 'express';
import { RouteError } from '@src/common/classes';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import Party from '@src/models/Party';
import { RestaurantConstants } from '@src/constants';
import logger from 'jet-logger';

export class PartyController {
  private getAvailableSeats = async (): Promise<number> => {
    const partiesInService = await Party.find({ status: 'in_service' });
    const occupiedSeats = partiesInService.reduce((total, party) => total + party.size, 0);
    return RestaurantConstants.MAX_PARTY_SIZE - occupiedSeats;
  };

  private processQueue = async (): Promise<void> => {
    const availableSeats = await this.getAvailableSeats();
    const waitingParties = await Party.find({ status: 'waiting' })
      .sort({ createdAt: 1 });

    for (const party of waitingParties) {
      if (party.size <= availableSeats) {
        party.status = 'ready';
        await party.save();
        logger.info(`Party ${party.sessionId} moved from waiting to ready`);
        break;
      }
    }
  };

  public join: RequestHandler = async (req: Request, res: Response) => {
    const { name, size } = req.body;
    
    if (!name || !size) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        'Name and party size are required',
      );
    }

    if (size > RestaurantConstants.MAX_PARTY_SIZE) {
      throw new RouteError(
        HttpStatusCodes.BAD_REQUEST,
        `Cannot accommodate parties larger than ${RestaurantConstants.MAX_PARTY_SIZE} people`,
      );
    }

    try {
      const availableSeats = await this.getAvailableSeats();
      const sessionId = Math.random().toString(36).substring(7);

      const waitingParties = await Party.find({ status: 'waiting' })
        .sort({ createdAt: 1 });

      const initialStatus = (size <= availableSeats && waitingParties.length === 0) 
        ? 'ready' 
        : 'waiting';

      const party = new Party({
        name,
        size,
        sessionId,
        status: initialStatus,
      });

      await party.save();

      if (initialStatus === 'waiting') {
        await this.processQueue();
      }

      logger.info(`New party joined - status: ${initialStatus}, sessionId: ${sessionId}, size: ${size}, availableSeats: ${availableSeats}, waitingPartiesCount: ${waitingParties.length}`);

      res.status(HttpStatusCodes.CREATED).json({
        party,
        sessionId,
        message: initialStatus === 'ready'
          ? 'Table is ready! Please check in.'
          : `Added to waitlist (Position: ${waitingParties.length + 1}). We will notify you when your table is ready.`,
      });
      
    } catch (error) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to process request, ${error}`,
      );
    }
  };
}
