import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Popover } from 'antd';
import reactStringReplace from 'react-string-replace';

import { convertShopStatus } from '../../../utils/convert';
import style from './index.less';

class SelectStaff extends PureComponent {
  state = {};

  onClose = e => {
    e.preventDefault();
  };

  handleClick = () => {};

  renderPupContent = item => (
    <div className={style.card_info}>
      <div className={style.card_header}>
        <div className={style.staff_name}>{item.name}</div>
        <div className={style.status}>
          <span>({item.shop_sn})</span>
        </div>
      </div>
      <div className={style.card_list}>
        <div>
          <span>所属部门：</span>
          <span>{item.department ? item.department.full_name : '暂无'}</span>
        </div>
        <div>
          <span>店铺地址：</span>
          <span>{item.full_address}</span>
        </div>
        <div>
          <span>店铺状态：</span>
          <span>{convertShopStatus(item.status_id)}</span>
        </div>
      </div>
    </div>
  );

  render() {
    const { extra, itemStyle, detail, checked, handleClick, keywords } = this.props;
    if (!detail) {
      return null;
    }
    const cls = classnames(style.base_info, { [style.checked]: checked });
    const pupContent = this.renderPupContent(detail);
    return (
      <div className={style.item_info} style={{ ...itemStyle }} onClick={handleClick}>
        <div style={{ float: 'left', padding: '' }} className={cls}>
          <div className={style.right}>
            <div className={style.clearfix} style={{ height: '18px', float: 'left' }}>
              <Popover
                content={pupContent}
                placement="rightBottom"
                overlayClassName={style.overlay}
              >
                <div className={style.card} />
              </Popover>
              <div className={style.name}>
                {reactStringReplace(
                  detail.name,
                  keywords.type === 1 ? keywords.value : '',
                  (match, i) => (
                    <span key={i} style={{ color: 'red' }}>
                      {match}
                    </span>
                  )
                )}
              </div>
            </div>
            <div className={style.des}>
              店铺编码：
              {reactStringReplace(
                `${detail.shop_sn}`,
                keywords.type === 1 ? keywords.value : '',
                (match, i) => (
                  <span key={i} style={{ color: 'red' }}>
                    {match}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
        {extra || null}
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  extra: <div className={style.delete}>x</div>,
  handleClick: () => {},
  keywords: '',
};
export default SelectStaff;
