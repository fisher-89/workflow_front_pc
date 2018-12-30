import React, { PureComponent } from 'react';
import styles from './detail.less';

class DetailItem extends PureComponent {
  state = {};

  render() {
    const {
      children,
      className,
      width,
      height,
      x,
      y,
      name,
      extraStyle,
      asideStyle,
      rightStyle,
    } = this.props;
    const itemStyle = {
      width: `${width}px`,
      height: `${height}px`,
      top: `${y}px`,
      left: `${x}px`,
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
