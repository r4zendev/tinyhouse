import React, { useState, useEffect } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Viewer } from '../../lib/types';
import { Layout, Input } from 'antd';
import { MenuItems } from './components';

import logo from './assets/tinyhouse-logo.png';
import { displayErrorMessage } from '../../lib/utils';

const { Header } = Layout;
const { Search } = Input;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const AppHeader = withRouter(
  ({ viewer, setViewer, location, history }: Props & RouteComponentProps) => {
    const [search, setSearch] = useState('');
    const onSearch = (value: string) => {
      const trimmedValue = value.trim();

      if (trimmedValue) {
        history.push(`/listings/${trimmedValue}`);
      } else {
        displayErrorMessage('Please enter a valid search!');
      }
    };

    useEffect(() => {
      const { pathname } = location;

      if (!pathname.includes('/listings')) {
        setSearch('');
        return;
      } else {
        const splitPath = pathname.split('/');
        if (splitPath.length === 3) {
          setSearch(splitPath[splitPath.length - 1]);
        }
      }
    }, [location]);

    return (
      <Header className="app-header">
        <div className="app-header__logo-search-section">
          <div className="app-header__logo">
            <Link to="/">
              <img src={logo} alt="App logo" />
            </Link>
          </div>
          <div className="app-header__search-input">
            <Search
              placeholder="Search 'San Francisco'"
              value={search}
              enterButton
              onSearch={onSearch}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <div className="app-header__menu-section">
          <MenuItems viewer={viewer} setViewer={setViewer} />
        </div>
      </Header>
    );
  },
);
