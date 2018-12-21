import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Popover } from 'antd';
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
    const { extra, itemStyle, detail, checked, handleClick } = this.props;
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
              <div className={style.name}>{detail.name}</div>
            </div>
            <div className={style.des}>
              店铺编码：
              {detail.shop_sn}
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
};
export default SelectStaff;
