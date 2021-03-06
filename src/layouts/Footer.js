import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0, background: '#fff' }}>
    <GlobalFooter
      links={
        [] || [
          {
            key: 'Pro 首页',
            title: 'Pro 首页',
            href: 'https://pro.ant.design',
            blankTarget: true,
          },
          {
            key: 'github',
            title: <Icon type="github" />,
            href: 'https://github.com/ant-design/ant-design-pro',
            blankTarget: true,
          },
          {
            key: 'Ant Design',
            title: 'Ant Design',
            href: 'https://ant.design',
            blankTarget: true,
          },
        ]
      }
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> 2019 喜歌实业IT部开发组出品
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;
