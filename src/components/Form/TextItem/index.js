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
    if (value === '' || value === undefined) {
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
    const { value } = this.state;
    const {
      field: { max, min, scale },
    } = this.props;
    return (
      <InputNumber
        max={max === '' ? Infinity : max - 0}
        min={min === '' ? -Infinity : min - 0}
        precision={scale}
        value={value}
        onChange={this.numberInputChange}
      />
    );
  };

  renderTextArea = () => {
    const { value } = this.state;
    return <Input.TextArea value={value} autosize={false} onChange={this.inputOnChange} />;
  };

  renderInput = () => {
    const { value } = this.state;
    return <Input value={value} onChange={this.inputOnChange} />;
  };

  makeNewProps = () => {
    const { field, required } = this.props;
    const { errorMsg } = this.state;
    const props = {
      ...field,
      required,
      errorMsg,
    };
    return props;
  };

  render() {
    const {
      field: { line, type },
    } = this.props;
    const { errorMsg } = this.state;
    return (
      <FormItem {...this.makeNewProps()}>
        <div className={errorMsg ? style.errorMsg : style.noerror}>
          {type === 'int' && this.renderNumberInput()}
          {!!(type === 'text' && line !== 1) && this.renderTextArea()}
          {!!(type === 'text' && line === 1) && this.renderInput()}
        </div>
      </FormItem>
    );
  }
}

TextItem.defaultProps = {
  onChange: () => {},
};
export default TextItem;
