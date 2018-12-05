import React, { PureComponent } from 'react';
import { connect } from 'dva';
import FormItem from '../FormItem';
import TagGroup from '../../TagGroup';
import style from './index.less';

@connect(({ interfaceApi }) => ({ sourceDetails: interfaceApi.sourceDetails }))
class SelectItem extends PureComponent {
  constructor(props) {
    super(props);
    const { defaultValue } = this.props;
    this.state = {
      value: defaultValue,
      errorMsg: '',
    };
  }

  handleOnChange = value => {
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
    const {
      field,
      required,
      field: { max, min },
    } = this.props;
    const { errorMsg, value } = this.state;
    const className = [style.tag, errorMsg ? style.errorMsg : ''].join(' ');
    return (
      <FormItem {...field} height="auto" errorMsg={errorMsg} required={required}>
        <div className={className}>
          <TagGroup value={value} range={{ max, min }} onChange={this.handleOnChange} />
        </div>
      </FormItem>
    );
  }
}

export default SelectItem;
