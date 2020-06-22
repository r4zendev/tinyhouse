import React from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { Button, Icon, Menu, Avatar } from 'antd';
import { Viewer } from '../../../../lib/types';
import { LogOut as LogOutData } from '../../../../lib/graphql/mutations/LogOut/__generated__/LogOut';
import {
  displaySuccessNotification,
  displayErrorMessage,
} from '../../../../lib/utils';
import { LOG_OUT } from '../../../../lib/graphql/mutations';

const { Item, SubMenu } = Menu;

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem('token');
        displaySuccessNotification('Successfully logged you out!');
      }
    },
    onError: (_data) => {
      displayErrorMessage(
        "Sorry! We weren''ble to log you out. Please try again later.",
      );
    },
  });

  const handleLogOut = () => {
    logOut();
  };

  const subMenuLogin = viewer.id ? (
    <SubMenu title={<Avatar src={viewer.avatar!} />}>
      <Item key="/user">
        <Link to={`/user/${viewer.id}`}>
          <Icon type="user" />
          Profile
        </Link>
      </Item>
      <Item key="/logout">
        <div onClick={handleLogOut}>
          <Icon type="logout" />
          Log Out
        </div>
      </Item>
    </SubMenu>
  ) : (
    <Item>
      <Link to="/login">
        <Button type="primary">Sign In</Button>
      </Link>
    </Item>
  );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <Icon type="home" />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
