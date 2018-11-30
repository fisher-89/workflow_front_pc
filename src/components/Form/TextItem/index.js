import React, { PureComponent } from 'react';
import { Input, Form, InputNumber } from 'antd';
import { connect } from 'dva';

import styles from '../index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 2 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
@connect()
class TextItem extends PureComponent {
  state = {};

  validateInput = (rule, value, callback) => {
    const {
      feild: { max },
    } = this.props;
    if (max !== '' && value.length > max) {
      callback(`长度需小于${max}`);
    }
  };

  renderNumberInput = () => {
    const {
      getFieldDecorator,
      defaultValue,
      feild: { key, max, min, scale, name },
      required,
    } = this.props;
    return getFieldDecorator(key, {
      initialValue: defaultValue,
      rules: [{ required, message: `请输入${name}` }],
    })(
      <InputNumber
        max={max === '' ? Infinity : max - 0}
        min={min === '' ? -Infinity : min - 0}
        precision={scale}
        onChange={this.handleOnChange}
      />
    );
  };

  renderTextArea = () => {
    const {
      getFieldDecorator,
      defaultValue,
      feild: { key, name },
      required,
    } = this.props;
    return getFieldDecorator(key, {
      initialValue: defaultValue,
      rules: [
        { required, message: `请输入${name}` },
        {
          validator: this.validateInput,
        },
      ],
    })(<Input.TextArea autosize={false} onChange={this.handleOnChange} />);
  };

  renderInput = () => {
    const {
      getFieldDecorator,
      defaultValue,
      feild: { key, name },
      required,
    } = this.props;
    return getFieldDecorator(key, {
      initialValue: defaultValue,
      rules: [
        { required, message: `请输入${name}` },
        {
          validator: this.validateInput,
        },
      ],
    })(<Input />);
  };

  render() {
    const {
      feild: { width, height, x, y, type, name, line },
    } = this.props;
    const itemStyle = {
      width,
      height,
      top: `${y}px`,
      left: `${x}px`,
    };
    return (
      <div className={styles.form_item} style={itemStyle}>
        <FormItem {...formItemLayout} label={name}>
          {type === 'int' && this.renderNumberInput()}
          {!!(type === 'text' && line !== 1) && this.renderTextArea()}
          {!!(type === 'text' && line === 1) && this.renderInput()}
        </FormItem>
      </div>
    );
  }
}

export default Form.create()(TextItem);
