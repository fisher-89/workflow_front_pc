import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const formItemLayout = {
  labelCol: {
    xs: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
class FormItem extends PureComponent {
  state = {};

  render() {
    const { children, className, width, height, x, y, name, errorMsg, required } = this.props;
    const itemStyle = {
      width,
      height,
      top: `${y}px`,
      left: `${x}px`,
    };
    const classnames = [styles.form_item, className].join(' ');
    const cls = classNames(styles.right, {
      [styles.has_error]: errorMsg,
    });
    return (
      <div className={classnames} style={itemStyle}>
        <div className={styles.item}>
          <div className={styles.aside}>
            {required && <span style={{ color: '#d9333f' }}>*</span>}
            {name}：
          </div>
          <div className={cls}>{children}</div>
        </div>
        <Tooltip placement="topLeft" title={errorMsg}>
          <div className={styles.error}>{errorMsg}</div>
        </Tooltip>
      </div>
    );
  }
}
FormItem.defaultProps = {
  errorMsg: '',
};
export default FormItem;
