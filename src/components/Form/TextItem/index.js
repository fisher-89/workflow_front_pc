import React, { PureComponent } from 'react';
import { Input, InputNumber } from 'antd';
import { connect } from 'dva';
import FormItem from '../FormItem';
import style from './index.less';

@connect()
class TextItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue,
      errorMsg: '',
    };
  }

  inputOnChange = e => {
    const {
      field: { max, name },
      onChange,
    } = this.props;
    const { value } = e.target;
    let errorMsg = '';
    if (max !== '' && value.length > max) {
      errorMsg = `长度需小于${max}`;
    } else if (value === '') {
      errorMsg = `请输入${name}`;
    }
    this.setState(
      {
        errorMsg,
        value,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  numberInputChange = value => {
    const {
      field: { name },
      onChange,
    } = this.props;
    let errorMsg = '';
    if (value === '') {
      errorMsg = `请输入${name}`;
    }
    this.setState(
      {
        errorMsg,
        value,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  renderNumberInput = () => {
    const { value, errorMsg } = this.state;
    const {
      field: { max, min, scale },
    } = this.props;
    return (
      <div className={errorMsg ? style.errorMsg : style.noerror}>
        <InputNumber
          max={max === '' ? Infinity : max - 0}
          min={min === '' ? -Infinity : min - 0}
          precision={scale}
          value={value}
          onChange={this.numberInputChange}
        />
      </div>
    );
  };

  renderTextArea = () => {
    const { value, errorMsg } = this.state;
    return (
      <div className={errorMsg ? style.errorMsg : style.noerror}>
        <Input.TextArea value={value} autosize={false} onChange={this.inputOnChange} />
      </div>
    );
  };

  renderInput = () => {
    const { value, errorMsg } = this.state;
    return (
      <div className={errorMsg ? style.errorMsg : style.noerror}>
        <Input value={value} onChange={this.inputOnChange} />
      </div>
    );
  };

  render() {
    const {
      field: { line, type },
      field,
    } = this.props;
    const { errorMsg } = this.state;
    return (
      <FormItem {...field} errorMsg={errorMsg}>
        {type === 'int' && this.renderNumberInput()}
        {!!(type === 'text' && line !== 1) && this.renderTextArea()}
        {!!(type === 'text' && line === 1) && this.renderInput()}
      </FormItem>
    );
  }
}
TextItem.defaultProps = {
  onChange: () => {},
};
export default TextItem;
