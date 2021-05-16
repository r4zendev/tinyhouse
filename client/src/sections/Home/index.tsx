import React from 'react';
import { RouteComponentProps, Link } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { LISTINGS } from '../../lib/graphql/queries';
import {
  Listings as ListingsData,
  ListingsVariables,
} from '../../lib/graphql/queries/Listings/__generated__/Listings';
import { ListingsFilter } from '../../lib/graphql/globalTypes';
import { Col, Row, Layout, Typography } from 'antd';
import { HomeHero, HomeListings, HomeListingsSkeleton } from './components';

import mapBackground from './assets/map-background.jpg';
import sanFranciscoImage from './assets/san-fransisco.jpg';
import cancunImage from './assets/cancun.jpg';
import { displayErrorMessage } from '../../lib/utils';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export const Home = ({ history }: RouteComponentProps) => {
  const { data, loading } = useQuery<ListingsData, ListingsVariables>(
    LISTINGS,
    {
      variables: {
        filter: ListingsFilter.PRICE_HIGH_TO_LOW,
        limit: 4,
        page: 1,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      history.push(`/listings/${value}`);
    } else {
      displayErrorMessage('Please enter a valid search!');
    }
  };

  const renderListingsSection = () => {
    if (loading) {
      return <HomeListingsSkeleton />;
    }

    if (data) {
      return (
        <HomeListings
          title="Premium Listings"
          listings={data.listings.result}
        ></HomeListings>
      );
    }
  };

  return (
    <Content className="home" style={{ backgroundImage: mapBackground }}>
      <HomeHero onSearch={onSearch} />
      <div className="home__cta-section">
        <Title level={2} className="home__cta-section-title">
          Your guide for all things rental
        </Title>
        <Paragraph>
          Helping you make the best decisions in renting your last minute
          locations.
        </Paragraph>
        <Link
          className="ant-btn ant-btn-primary ant-btn-lg home__cta-section-button"
          to="/listings/united%20states"
        >
          Popular listings in the United States
        </Link>
      </div>

      {renderListingsSection()}

      <div>
        <Title level={4} className="home__listings-title">
          Listings of any kind
        </Title>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Link to="/listings/san%20francisco">
              <div className="home__listings-img-cover">
                <img
                  src={sanFranciscoImage}
                  alt="San Francisco"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
          <Col xs={24} sm={12}>
            <Link to="/listings/cancún">
              <div className="home__listings-img-cover">
                <img
                  src={cancunImage}
                  alt="Cancún"
                  className="home__listings-img"
                />
              </div>
            </Link>
          </Col>
        </Row>
      </div>
    </Content>
  );
};
