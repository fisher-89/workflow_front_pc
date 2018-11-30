import React, { PureComponent } from 'react';
import { Form } from 'antd';
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
    const { children, className, width, height, x, y, name } = this.props;
    const itemStyle = {
      width,
      height,
      top: `${y}px`,
      left: `${x}px`,
    };
    const classnames = [styles.form_item, className].join(' ');
    return (
      <div className={classnames} style={itemStyle}>
        <Form.Item {...formItemLayout} label={name}>
          {children}
        </Form.Item>
      </div>
    );
  }
}

export default FormItem;
