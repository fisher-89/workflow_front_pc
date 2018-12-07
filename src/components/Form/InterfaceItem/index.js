import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Select from '../../Select';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class UploadItem extends PureComponent {
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

  onSingleChange = value => {
    let errorMsg = '';
    const {
      field: { name },
    } = this.props;
    if (value === null || value === undefined) {
      errorMsg = `请选择${name}`;
    }
    this.setState({
      value,
      errorMsg,
    });
  };

  onMutiChange = value => {
    let errorMsg = '';
    const {
      field: { name },
    } = this.props;
    if (!value.length) {
      errorMsg = `请选择${name}`;
    }
    this.setState({
      value,
      errorMsg,
    });
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

  render() {
    const { field, required, disabled } = this.props;
    const { errorMsg, value } = this.state;
    const options = this.getOptions();
    if (!field.is_checkbox) {
      const className = [style.inteface, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className}>
            <Select
              disabled={disabled}
              options={options}
              value={value}
              onChange={this.onSingleChange}
            />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiinteface, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem {...field} height="auto" errorMsg={errorMsg} required={required}>
        <div className={className}>
          <Select
            disabled={disabled}
            options={options}
            value={value}
            mode="multiple"
            onChange={this.onMutiChange}
          />
        </div>
      </FormItem>
    );
  }
}

export default UploadItem;
