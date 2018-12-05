import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import Select from '../../Select';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class SelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue, field } = this.props;
    const muti = field.is_checkbox;
    this.state = {
      value: defaultValue || (muti ? [] : ''),
      errorMsg: '',
    };
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
    const {
      field: { options },
    } = this.props;
    const newOpts = (options || []).map(item => {
      const opt = { value: item, text: item };
      return opt;
    });
    return newOpts;
  };

  render() {
    const { field, required } = this.props;
    const { errorMsg, value } = this.state;
    const options = this.getOptions();
    if (!field.is_checkbox) {
      const className = [style.select, errorMsg ? style.errorMsg : ''].join(' ');
      return (
        <FormItem {...field} errorMsg={errorMsg} required={required}>
          <div className={className}>
            <Select options={options} value={value} onChange={this.onSingleChange} />
          </div>
        </FormItem>
      );
    }
    const className = [style.mutiselect, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem {...field} height="auto" errorMsg={errorMsg} required={required}>
        <div className={className}>
          <Select options={options} mode="multiple" value={value} onChange={this.onMutiChange} />
        </div>
      </FormItem>
    );
  }
}

export default SelectItem;
