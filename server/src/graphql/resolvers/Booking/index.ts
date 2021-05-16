import { Request } from 'express';
import { IResolvers } from 'apollo-server-express';
import {
  Booking,
  Database,
  Listing,
  User,
  BookingsIndex,
} from '../../../lib/types';
import { CreateBookingArgs } from './types';
import { authorize } from '../../../lib/utils';
import { ObjectId } from 'mongodb';
import { Stripe } from '../../../lib/api';

const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string,
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }
    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }
    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error(
        'Selected dates cannot overlap dates that have already been booked.',
      );
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }

  return newBookingsIndex;
};

export const bookingResolvers: IResolvers = {
  Mutation: {
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request },
    ): Promise<Booking> => {
      try {
        const { id, source, checkIn, checkOut } = input;

        // verify a logged in user is making a request
        const viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error('Viewer could not be found.');
        }

        // find listing document that is being booked
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          throw new Error('Listing could not be found.');
        }

        // check that viewer is NOT booking their own listing
        if (listing.host === viewer._id) {
          throw new Error('Viewer cannot book his own listing.');
        }

        // check that checkOut is NOT before checkIn
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkOutDate < checkInDate) {
          throw new Error('Check out date cannot be before the checkIn date.');
        }

        // create a new bookingsIndex for listing being booked
        const bookingsIndex = resolveBookingsIndex(
          listing.bookingsIndex,
          checkIn,
          checkOut,
        );

        // get total price to charge
        const totalPrice =
          listing.price *
          ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);

        // get user doc of host
        const host = await db.users.findOne({ _id: listing.host });
        if (!host || !host.walletId) {
          throw new Error(
            'The host either could not be found or is not connected with Stripe.',
          );
        }

        // create stripe charge on behalf of host
        await Stripe.charge(totalPrice, source, host.walletId);

        // insert a new booking doc to bookings collection
        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut,
        });

        const insertedBooking: Booking = insertRes.ops[0];

        // update user doc of host to inc income
        await db.users.updateOne(
          { _id: host._id },
          { $inc: { income: totalPrice } },
        );

        // update bookings field of tenant
        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id } },
        );

        // update bookings field of listing doc
        await db.listings.updateOne(
          { _id: listing._id },
          { $set: { bookingsIndex }, $push: { bookings: insertedBooking._id } },
        );

        // return newly inserted booking

        return insertedBooking;
      } catch (err) {
        throw new Error(`Failed to create a booking. Error: ${err}`);
      }
    },
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing: (
      booking: Booking,
      _args: unknown,
      { db }: { db: Database },
    ): Promise<Listing | null> => {
      return db.listings.findOne({ _id: booking.listing });
    },
    tenant: (
      booking: Booking,
      _args: unknown,
      { db }: { db: Database },
    ): Promise<User | null> => {
      return db.users.findOne({ _id: booking.tenant });
    },
  },
};
