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
        // errorMsg,
        value,
      }
      // () => {
      //   onChange(value, errorMsg);
      // }
    );
  };

  inputOnFocus = e => {
    this.setState({
      errorMsg: '',
    });
  };

  inputOnBlur = e => {
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
    this.setState({
      value,
    });
  };

  numberOnBlur = e => {
    const { value } = e.target;
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
      field: { max, min, scale, description },
      disabled,
    } = this.props;
    const desc = description || `${defaultInfo}`;
    return (
      <InputNumber
        max={max === '' ? Infinity : max - 0}
        min={min === '' ? -Infinity : min - 0}
        disabled={disabled}
        precision={scale}
        value={value}
        placeholder={desc}
        onChange={this.numberInputChange}
        onBlur={this.numberOnBlur}
        onFocus={this.numberOnFocus}
      />
    );
  };

  renderTextArea = () => {
    const { value } = this.state;
    const {
      disabled,
      field: { description },
    } = this.props;
    const desc = description || `${defaultInfo}`;

    return (
      <Input.TextArea
        value={value}
        autosize={false}
        style={{ resize: 'none' }}
        placeholder={desc}
        disabled={disabled}
        onChange={this.inputOnChange}
        onBlur={this.inputOnBlur}
        onFocus={this.inputOnFocus}
      />
    );
  };

  makeNewProps = () => {
    const {
      field,
      required,
      asideStyle,
      template,
      extraStyle,
      disabled,
      ratio: { xRatio },
      field: { type },
    } = this.props;
    const { errorMsg } = this.state;
    const extraStyles = type !== 'int' && (!template ? { minWidth: `${10 * xRatio}px` } : null);
    const props = {
      ...field,
      required,
      errorMsg,
      disabled,
      asideStyle,
      extraStyle: { ...extraStyles, ...extraStyle },
      rightStyle: { overflowY: 'hidden' },
      template,
    };
    return props;
  };

  renderInfo = (value, field, template, { smXRatio }) => (
    <DetailItem
      {...field}
      template={template}
      extraStyle={
        !template && field.type === 'text' && (field.max || 31) > 30
          ? { width: `${10 * smXRatio}px` }
          : {}
      }
    >
      <span> {value}</span>
    </DetailItem>
  );

  render() {
    const {
      field: { type },
      field,
      ratio,
      template,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    if (readonly) {
      return this.renderInfo(value, field, template, ratio);
    }
    return (
      <FormItem {...this.makeNewProps()}>
        <div className={[errorMsg ? style.errorMsg : style.noerror, style.text].join(' ')}>
          {' '}
          {type === 'int' && this.renderNumberInput()} {type === 'text' && this.renderTextArea()}
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
