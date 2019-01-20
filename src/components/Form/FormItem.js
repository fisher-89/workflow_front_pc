import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const yRatio = 60;
const xRatio = 60;
class FormItem extends PureComponent {
  state = {};

  render() {
    const {
      children,
      className,
      col,
      disabled,
      template,
      row,
      name,
      errorMsg,
      required,
      extraStyle,
      asideStyle,
      rightStyle,
    } = this.props;

    const itemStyle = {
      ...(template
        ? {
            width: `${col * xRatio}px`,
            height: `${row * yRatio}px`,
          }
        : { width: '300px' }),
      ...extraStyle,
    };
    const classnames = [styles.form_item, className].join(' ');
    const cls = classNames(styles.right, {
      [styles.has_error]: errorMsg,
    });
    const rightSty = template
      ? { height: `${row * yRatio - 28}px`, overflowX: 'hidden', overflowY: 'scroll' }
      : null;
    return (
      <div className={classnames} style={itemStyle}>
        <div className={styles.item}>
          <div className={styles.aside} style={asideStyle}>
            {required && <span style={{ color: '#d9333f' }}>*</span>}
            {name}：
          </div>
          <div
            className={cls}
            style={{
              background: disabled ? '#f0f0f0' : '#fff',
              overflowX: 'hidden',
              ...rightSty,
              ...rightStyle,
            }}
          >
            {children}
          </div>
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
  asideStyle: {},
  rightStyle: {},
};
export default FormItem;
