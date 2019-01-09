import React, { PureComponent } from 'react';
import { FormattedMessage, formatMessage } from 'umi/locale';
import { Spin, Tag, Menu, Icon, Dropdown, Avatar } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
// import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
// import SelectLang from '../SelectLang';
import styles from './index.less';

export default class GlobalHeaderRight extends PureComponent {
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  render() {
    const {
      currentUser,
      // fetchingNotices,
      // onNoticeVisibleChange,
      onMenuClick,
      // onNoticeClear,
      theme,
      navTheme,
    } = this.props;
    console.log(navTheme);
    const menu = (
      <Menu
        className={styles.menu}
        selectedKeys={[]}
        onClick={onMenuClick}
        style={{ padding: 0 }}
        theme={navTheme}
      >
        {/* <Menu.Item key="userCenter">
          <FormattedMessage id="menu.account.center" defaultMessage="account center" />
        </Menu.Item>
        <Menu.Divider /> */}
        <Menu.Item key="logout">
          <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
        </Menu.Item>
      </Menu>
    );
    // const noticeData = this.getNoticeData();
    let className = styles.right;
    if (navTheme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        {/* <HeaderSearch
          className={`${styles.action} ${styles.search}`}
          placeholder={formatMessage({ id: 'component.globalHeader.search' })}
          onSearch={value => {
            console.log('input', value); // eslint-disable-line
          }}
          onPressEnter={value => {
            console.log('enter', value); // eslint-disable-line
          }}
        >
          搜索
        </HeaderSearch>
        <span className={`${styles.action} ${styles.setting}`}>
          <Icon type="setting" /> 设置
        </span> */}
        {currentUser.realname ? (
          <Dropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                alt="avatar"
                className={styles.avatar}
                style={{ width: 48, height: 48 }}
                src={currentUser.avatar || '/default_avatar.png'}
              />
              <span className={styles.name} style={{ marginRight: 50 }}>
                {currentUser.realname}
              </span>
              <Icon type="down" />
            </span>
          </Dropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
      </div>
    );
  }
}
