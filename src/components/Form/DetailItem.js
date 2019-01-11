import React, { PureComponent } from 'react';
import styles from './detail.less';

class DetailItem extends PureComponent {
  state = {};

  render() {
    const {
      children,
      className,
      col,
      row,
      template,
      name,
      extraStyle,
      asideStyle,
      rightStyle,
    } = this.props;
    const itemStyle = {
      ...(template
        ? {
            width: `${col * 50}px`,
            height: `${row * 50}px`,
          }
        : { height: 'auto' }),
      ...extraStyle,
    };
    const classnames = [styles.form_item, className].join(' ');
    return (
      <div className={classnames} style={itemStyle}>
        <div className={styles.item}>
          <div className={styles.aside} style={asideStyle}>
            {name}：
          </div>
          <div className={styles.right} style={{ ...rightStyle }}>
            {children}
          </div>
        </div>
      </div>
    );
  }
}
DetailItem.defaultProps = {
  asideStyle: {},
  rightStyle: {},
};
export default DetailItem;
