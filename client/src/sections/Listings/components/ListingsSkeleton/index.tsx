import React from 'react';
import { List, Card, Skeleton } from 'antd';

import listingLoadingCardCover from '../../assets/listing-loading-card-cover.jpg';

export const ListingsSkeleton = () => {
  const emptyData = [{}, {}, {}, {}, {}, {}, {}, {}];

  return (
    <div>
      <Skeleton paragraph={{ rows: 1 }} />
      <List
        grid={{ gutter: 8, xs: 1, sm: 2, lg: 4 }}
        dataSource={emptyData}
        renderItem={() => (
          <List.Item>
            <Card
              cover={
                <div
                  style={{ backgroundImage: listingLoadingCardCover }}
                  className="listings-skeleton__card-cover-img"
                ></div>
              }
              loading
              className="listings-skeleton__card"
            ></Card>
          </List.Item>
        )}
      ></List>
    </div>
  );
};
