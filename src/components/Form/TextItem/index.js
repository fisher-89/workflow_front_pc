import React, { PureComponent } from 'react';
import { Input, Form, InputNumber } from 'antd';
import { connect } from 'dva';
import FormItem from '../FormItem';

@connect()
class TextItem extends PureComponent {
  state = {};

  validateInput = (rule, value, callback) => {
    const {
      feild: { max },
    } = this.props;
    if (max !== '' && value.length > max) {
      callback(`长度需小于${max}`);
    } else {
      callback();
    }
  };

  renderNumberInput = () => {
    const {
      form: { getFieldDecorator },
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
      form: { getFieldDecorator },
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
      form: { getFieldDecorator },
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
      feild: { line, type },
      feild,
    } = this.props;

    return (
      <FormItem {...feild}>
        {type === 'int' && this.renderNumberInput()}
        {!!(type === 'text' && line !== 1) && this.renderTextArea()}
        {!!(type === 'text' && line === 1) && this.renderInput()}
      </FormItem>
    );
  }
}

export default Form.create()(TextItem);
