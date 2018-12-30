import React, { Component } from 'react';
import { Input, InputNumber } from 'antd';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import style from './index.less';

@connect()
class TextItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultValue,
      errorMsg: '',
    };
  }

  componentWillReceiveProps(props) {
    const { value, errorMsg } = props;
    if (JSON.stringify(value) !== this.props.value || errorMsg !== this.props.errorMsg) {
      this.setState({
        value,
        errorMsg,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(this.state) !== JSON.stringify(nextState)
    );
  }

  inputOnChange = e => {
    const {
      field: { max, name },
      onChange,
      required,
    } = this.props;
    const { value } = e.target;
    let errorMsg = '';
    if (max !== '' && value.length > max) {
      errorMsg = `长度需小于${max}`;
    } else if (required && value === '') {
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
      disabled,
    } = this.props;
    return (
      <InputNumber
        max={max === '' ? Infinity : max - 0}
        min={min === '' ? -Infinity : min - 0}
        disabled={disabled}
        precision={scale}
        value={value}
        onChange={this.numberInputChange}
      />
    );
  };

  renderTextArea = () => {
    const { value } = this.state;
    const { disabled } = this.props;
    return (
      <Input.TextArea
        value={value}
        autosize={false}
        disabled={disabled}
        onChange={this.inputOnChange}
      />
    );
  };

  renderInput = () => {
    const { value } = this.state;
    const { disabled } = this.props;

    return <Input value={value} onChange={this.inputOnChange} disabled={disabled} />;
  };

  makeNewProps = () => {
    const { field, required, asideStyle } = this.props;
    const { errorMsg } = this.state;
    const props = {
      ...field,
      required,
      errorMsg,
      asideStyle,
    };
    return props;
  };

  renderInfo = (value, field) => (
    <DetailItem {...field}>
      <span>{value}</span>
    </DetailItem>
  );

  render() {
    const {
      field: { line, type },
      field,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    if (readonly) {
      return this.renderInfo(value, field);
    }
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
