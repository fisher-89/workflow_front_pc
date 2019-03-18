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
      required,
    } = this.props;
    const { value } = e.target;
    // if (max !== '' && value.length > max) {
    //   errorMsg = `长度需小于${max}`;
    // } else if (required && value === '') {
    //   errorMsg = `请输入${name}`;
    // }
    this.setState({
      value,
    });
  };

  inputOnFocus = e => {
    const { value } = this.state;
    this.setState(
      {
        errorMsg: '',
      },
      () => {
        this.props.onChange(value, '');
      }
    );
  };

  inputOnBlur = e => {
    const {
      field: { max, min, name },
      onChange,
      required,
    } = this.props;
    const { value } = e.target;
    let errorMsg = '';
    // if (max !== '' && (value.length - max>0)) {
    //   errorMsg = `长度需小于${max}`;
    // } else if (required && value === '') {
    //   errorMsg = `请输入${name}`;
    // }
    if (min !== '' && max !== '' && (value.length - max > 0 || value.length - min < 0)) {
      errorMsg = `长度应介于${min}~${max}之间`;
    } else if (min === '' && max !== '' && value.length - max > 0) {
      errorMsg = `长度应小于${max}`;
    } else if (max === '' && min !== '' && value.length - min < 0) {
      errorMsg = `输入的长度应大于${min}`;
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

  formatIntValue = (v, field) => {
    const { scale, min } = field;
    const value = v !== '' && min !== '' && min - v > 0 ? min : v;
    const idx = value.indexOf('.');
    const curScale = idx > -1 ? value.slice(idx + 1).length : 0;
    // const newValue = curScale > scale ? (value.slice(0, value.indexOf('.') + (scale - 0) + 1))
    // : Number(value).toFixed(scale);
    let newValue;
    if (v !== '' && !isNaN(v)) {
      const tmpValue = `${Number(value)}`;
      newValue =
        curScale > scale
          ? tmpValue.slice(0, tmpValue.indexOf('.') + (scale - 0) + 1)
          : Number(value).toFixed(scale);
    } else {
      newValue = '';
    }
    return newValue;
  };

  numberOnBlur = e => {
    const { value } = e.target;
    const {
      field: { name, required, max, min },
      field,
      onChange,
    } = this.props;
    let errorMsg = '';
    if (required && (value === '' || value === undefined)) {
      errorMsg = `请输入${name}`;
    }
    if (value !== '' || value !== undefined) {
      if (min !== '' && max !== '' && (value - max > 0 || value - min < 0)) {
        errorMsg = `输入的值应介于${min}~${max}之间`;
      } else if (min === '' && max !== '' && value - max > 0) {
        errorMsg = `输入的值应小于${max}`;
      } else if (max === '' && min !== '' && value - min < 0) {
        errorMsg = `输入的值应大于${min}`;
      }
    }

    const newValue = this.formatIntValue(`${value || ''}`, field);
    this.setState(
      {
        errorMsg,
        value: newValue,
      },
      () => {
        onChange(newValue, errorMsg);
      }
    );
  };

  renderNumberInput = () => {
    const { value } = this.state;
    const {
      field: { max, min, scale, description },
      field,
      disabled,
    } = this.props;
    const desc = description || `${defaultInfo}`;
    return (
      <InputNumber
        // max={max === '' ? Infinity : max - 0}
        // min={min === '' ? -Infinity : min - 0}
        disabled={disabled}
        // precision={scale || 0}
        value={value}
        placeholder={desc}
        onChange={this.numberInputChange}
        onBlur={this.numberOnBlur}
        onFocus={this.inputOnFocus}
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
