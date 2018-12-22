import React, { PureComponent } from 'react';
import classnames from 'classnames';
import reactStringReplace from 'react-string-replace';
import { Popover } from 'antd';
import style from './index.less';

class SelectStaff extends PureComponent {
  state = {};

  onClose = e => {
    e.preventDefault();
  };

  handleClick = () => {};

  renderKeyWords = str => {
    const { keywords } = this.props;
    return <React.Fragment>{str.replace(keywords, <span>{keywords}</span>)}</React.Fragment>;
  };

  renderPupContent = item => (
    <div className={style.card_info}>
      <div className={style.card_header}>
        <div className={style.staff_name}>
          {item.realname}
          <span>({item.staff_sn})</span>
        </div>
        <div className={style.status}>
          状态：
          <span>{item.status ? item.status.name : '暂无'}</span>
        </div>
      </div>
      <div className={style.card_list}>
        <div>
          <span>职位：</span>
          <span>{item.position ? item.position.name : '暂无'}</span>
        </div>
        <div>
          <span>部门：</span>
          <span>{item.department ? item.department.full_name : '暂无'}</span>
        </div>
        <div>
          <span>品牌：</span>
          <span>{item.brand ? item.brand.name : '暂无'}</span>
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
          <img src="/default_avatar.png" alt="默认" />
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
                {reactStringReplace(detail.realname, keywords, (match, i) => (
                  <span key={i} style={{ color: 'red' }}>
                    {match}
                  </span>
                ))}
              </div>
              <div className={style.sno}>
                (
                {reactStringReplace(`${detail.staff_sn}`, keywords, (match, i) => (
                  <span key={i} style={{ color: 'red' }}>
                    {match}
                  </span>
                ))}
                )
              </div>
            </div>
            <div className={style.des}>{detail.department ? detail.department.full_name : ''}</div>
          </div>
        </div>
        {extra || null}
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  extra: <div className={style.delete}>x</div>,
  keywords: '',
  handleClick: () => {},
};
export default SelectStaff;
