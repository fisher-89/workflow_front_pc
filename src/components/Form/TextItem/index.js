import React, { Component } from 'react';
import { Input, InputNumber } from 'antd';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import style from './index.less';

const defaultInfo = '请输入';
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
      field: { name, required },
      onChange,
    } = this.props;
    let errorMsg = '';
    if (required && (value === '' || value === undefined)) {
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
      field: { max, min, scale, description, name },
      disabled,
    } = this.props;
    const desc = description || `${defaultInfo}${name}`;
    return (
      <InputNumber
        max={max === '' ? Infinity : max - 0}
        min={min === '' ? -Infinity : min - 0}
        disabled={disabled}
        precision={scale}
        value={value}
        placeholder={desc}
        onChange={this.numberInputChange}
      />
    );
  };

  renderTextArea = () => {
    const { value } = this.state;
    const {
      disabled,
      field: { description, name },
    } = this.props;
    const desc = description || `${defaultInfo}${name}`;

    return (
      <Input.TextArea
        value={value}
        autosize={false}
        style={{ resize: 'none' }}
        placeholder={desc}
        disabled={disabled}
        onChange={this.inputOnChange}
      />
    );
  };

  renderInput = () => {
    const { value } = this.state;
    const {
      disabled,
      field: { description, name },
    } = this.props;
    const desc = description || `${defaultInfo}${name}`;
    return (
      <Input value={value} placeholder={desc} onChange={this.inputOnChange} disabled={disabled} />
    );
  };

  makeNewProps = () => {
    const {
      field,
      required,
      asideStyle,
      template,
      extraStyle,
      ratio: { xRatio },
      field: { max, type },
    } = this.props;
    const { errorMsg } = this.state;
    const extraStyles = type !== 'int' && (max || 31) > 30 ? { minWidth: `${8 * xRatio}px` } : null;
    console.log('extraStyle', extraStyle);
    const props = {
      ...field,
      required,
      errorMsg,
      asideStyle,
      extraStyle: { ...extraStyles, ...extraStyle },
      template,
    };
    return props;
  };

  renderInfo = (value, field, template) => (
    <DetailItem {...field} template={template}>
      <span> {value}</span>
    </DetailItem>
  );

  render() {
    const {
      field: { type, max },
      field,
      template,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    if (readonly) {
      return this.renderInfo(value, field, template);
    }
    return (
      <FormItem {...this.makeNewProps()}>
        <div className={errorMsg ? style.errorMsg : style.noerror}>
          {type === 'int' && this.renderNumberInput()}{' '}
          {!!(type === 'text' && (max || 31) > 30) && this.renderTextArea()}{' '}
          {!!(type === 'text' && (max || 1) <= 30) && this.renderInput()}
        </div>
      </FormItem>
    );
  }
}

TextItem.defaultProps = {
  onChange: () => {},
  ratio: {},
};
export default TextItem;
