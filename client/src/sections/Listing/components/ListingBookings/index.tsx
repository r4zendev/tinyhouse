import React from 'react';
import { Avatar, Divider, List, Typography } from 'antd';
import { Listing as ListingData } from '../../../../lib/graphql/queries/Listing/__generated__/Listing';
import { Link } from 'react-router-dom';

interface Props {
  listingBookings: ListingData['listing']['bookings'];
  bookingsPage: number;
  limit: number;
  setBookingsPage: (page: number) => void;
}

const { Title, Text } = Typography;

export const ListingBookings = ({
  listingBookings,
  bookingsPage,
  limit,
  setBookingsPage,
}: Props) => {
  const total = listingBookings?.total;
  const result = listingBookings?.result;

  const listingBookingsList = listingBookings && (
    <List
      grid={{ gutter: 8, xs: 1, sm: 2, lg: 3 }}
      dataSource={result}
      locale={{ emptyText: 'No bookings have been made yet!' }}
      pagination={{
        current: bookingsPage,
        total,
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => {
          setBookingsPage(page);
        },
      }}
      renderItem={(listingBooking) => {
        const bookingHistory = (
          <div className="listing-bookings__history">
            <div>
              Check in: <Text strong>{listingBooking.checkIn}</Text>
            </div>
            <div>
              Check out: <Text strong>{listingBooking.checkOut}</Text>
            </div>
          </div>
        );
        return (
          <List.Item className="listing-bookings__item">
            {bookingHistory}
            <Link to={`/user/${listingBooking.tenant.id}`}>
              <Avatar
                src={listingBooking.tenant.avatar}
                size={64}
                shape="square"
              />
            </Link>
          </List.Item>
        );
      }}
    ></List>
  );

  const listingBookingsElement = listingBookingsList ? (
    <div className="listing-bookings">
      <Divider />
      <div className="listing-bookings__section"></div>
      <Title level={4} className="user-bookings__title">
        Bookings
      </Title>
      {listingBookingsList}
    </div>
  ) : null;

  return listingBookingsElement;
};
