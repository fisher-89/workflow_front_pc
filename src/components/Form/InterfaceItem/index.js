import React, { Component } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import DetailItem from '../DetailItem';

import Select from '../../Select';
import { validValue } from '../../../utils/utils';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class InterfaceItem extends Component {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    this.state = {
      value: defaultValue || (muti ? [] : ''),
      errorMsg: '',
    };
  }

  componentWillMount() {
    const { dispatch, field } = this.props;
    this.id = field.field_api_configuration_id;
    dispatch({
      type: 'interfaceApi/fetchApi',
      payload: {
        id: this.id,
      },
    });
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

  onSingleChange = value => {
    this.dealValueOnChange(value);
  };

  onMutiChange = value => {
    this.dealValueOnChange(value);
  };

  dealValueOnChange = value => {
    const { onChange } = this.props;

    const errorMsg = validValue(value, this.props);
    this.setState(
      {
        value,
        errorMsg,
      },
      () => {
        onChange(value, errorMsg);
      }
    );
  };

  getOptions = () => {
    const { sourceDetails } = this.props;
    return sourceDetails[this.id] || [];
  };

  validateFile = (rule, value, callback) => {
    const { required } = this.props;
    if (required && (!value || value.length === 0)) {
      callback();
    } else callback();
  };

  renderInfo = (value, field, multiple) => (
    <DetailItem {...field}>
      {' '}
      <span>{multiple ? (value || []).join('，') : value}</span>
    </DetailItem>
  );

  render() {
    const {
      field,
      field: { id },
      required,
      disabled,
      readonly,
    } = this.props;
    const { errorMsg, value } = this.state;
    const options = this.getOptions();
    const newId = `${id}-select`;
    if (readonly) {
      return this.renderInfo(value, field, field.is_checkbox);
    }
    if (!field.is_checkbox) {
      const className = [style.inteface, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className} id={newId}>
            <Select
              disabled={disabled}
              options={options}
              value={value}
              getPopupContainer={() => document.getElementById(newId)}
              onChange={this.onSingleChange}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiinteface, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem
        {...field}
        height="auto"
        errorMsg={errorMsg}
        required={required}
        extraStyle={{ height: 'auto', minWidth: '600px' }}
      >
        <div className={className} id={newId}>
          <Select
            disabled={disabled}
            options={options}
            value={value || []}
            mode="multiple"
            getPopupContainer={() => document.getElementById(newId)}
            onChange={this.onMutiChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default InterfaceItem;
