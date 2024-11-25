/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, RequestHandler } from 'express';
import { RouteError } from '@src/common/classes';
import HttpStatusCodes from '@src/common/HttpStatusCodes';
import Party from '@src/models/Party';
import { IParty } from '@src/models/Party';
import { RestaurantConstants } from '@src/constants';
import logger from 'jet-logger';
import { io } from '@src/server';

export class PartyController {
  private getAvailableSeats = async (): Promise<number> => {
    const activeParties = await Party.find({ 
      status: { $in: ['in_service', 'ready'] }, 
    });
        
    const occupiedSeats = activeParties.reduce((total, party) => total + party.size, 0);

    logger.info(`Active parties: ${JSON.stringify(activeParties.map(p => ({
      id: p.sessionId,
      size: p.size,
      status: p.status,
    })))}`);
    logger.info(`Total occupied seats: ${occupiedSeats}`);
        
    const availableSeats = RestaurantConstants.MAX_PARTY_SIZE - occupiedSeats;
    logger.info(`Available seats: ${availableSeats}`);
        
    return availableSeats;
  };

  private processQueue = async (): Promise<void> => {
    const availableSeats = await this.getAvailableSeats();
    const waitingParties = await Party.find({ status: 'waiting' })
      .sort({ createdAt: 1 });

    for (const party of waitingParties) {
      if (party.size <= availableSeats) {
        party.status = 'ready';
        await party.save();

        this.startCountdown(party);
        io.to(party.sessionId).emit('statusUpdate', {  party: {
          ...party.toObject(),
          message: 'Your table is ready! Please check in within 15 seconds.',
        } });
        logger.info(`Party ${party.sessionId} moved from waiting to ready`);
        break;
      }
    }
  };

  private processService = (party: IParty): void => {
    try {
      const serviceTimeMs = party.size * RestaurantConstants.SERVICE_TIME_PER_PERSON;

      setTimeout(async () => {
        party.status = 'completed';
        await party.save();

        io.to(party.sessionId).emit('statusUpdate', { party });
        logger.info(`Service completed for party ${party.sessionId}`);
        await this.processQueue();
      }, serviceTimeMs);
    } catch (error) {
      logger.err(`Error processing service: ${error}`);
    }
  };

  private startCountdown = (party: IParty): void => {
    setTimeout(async () => {
      try {
        const currentParty = await Party.findOne({ sessionId: party.sessionId });
        
        if (currentParty && currentParty.status === 'ready') {
          logger.info(`Party ${party.sessionId} did not check in within 15 seconds - removing from system`);
          
          await Party.deleteOne({ sessionId: party.sessionId });
          
          io.to(party.sessionId).emit('statusUpdate', { 
            party: {
              ...currentParty.toObject(),
              status: 'completed',
              message: 'Removed due to inactivity',
            },
          });

          await this.processQueue();
        }
      } catch (error) {
        logger.err(`Error processing ready timeout: ${error}`);
      }
    }, RestaurantConstants.READY_TIMEOUT_MS);
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

      if (initialStatus === 'ready') {
        this.startCountdown(party);
      }

      logger.info(`New party joined - status: ${initialStatus}, sessionId: ${sessionId}, size: ${size}, availableSeats: ${availableSeats}, waitingPartiesCount: ${waitingParties.length}`);

      res.status(HttpStatusCodes.CREATED).json({
        party: {
          ...party.toObject(),
          message: initialStatus === 'ready'
            ? 'Table is ready! Please check in.'
            : `Added to waitlist (Position: ${waitingParties.length + 1}). We will notify you when your table is ready.`,
        },
        sessionId,
      });
    } catch (error) {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to process request, ${error}`,
      );
    }
  };

  public checkIn: RequestHandler = async (req, res) => {
    const { sessionId } = req.body as { sessionId: string };

    try {
      const party = await Party.findOne({ sessionId, status: 'ready' });

      if (!party) {
        throw new RouteError(
          HttpStatusCodes.NOT_FOUND,
          'Party not found or not ready for check-in',
        );
      }

      party.status = 'in_service';
      party.serviceStartTime = new Date();
      party.serviceEndTime = new Date(Date.now() + (party.size * RestaurantConstants.SERVICE_TIME_PER_PERSON));
      await party.save();

      io.to(sessionId).emit('statusUpdate', { party });
      this.processService(party);

      logger.info(`Party ${sessionId} checked in and started service`);

      res.json({
        party,
        message: `Service started. Estimated time: ${party.size * 3} seconds`,
      });

    } catch (error) {
      if (error instanceof RouteError) throw error;
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to process check-in',
      );
    }
  };

  public getStatus: RequestHandler = async (req, res) => {
    const { sessionId } = req.params as { sessionId: string };
  
    try {
      const party = await Party.findOne({ sessionId });
  
      if (!party) {
        throw new RouteError(
          HttpStatusCodes.NOT_FOUND,
          'Party not found',
        );
      }
  
      res.json({ party });
    } catch (error) {
      if (error instanceof RouteError) throw error;
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'Failed to get party status',
      );
    }
  };
}
