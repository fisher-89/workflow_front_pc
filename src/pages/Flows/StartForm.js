import React, { PureComponent } from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import { judgeIsNothing } from '../../utils/utils';
import { EditForm } from '../../components/Form/index';

@connect(({ start }) => ({ startDetails: start.flowDetails }))
class StartForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
    };
  }

  componentWillMount() {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props;
    this.id = id;
    dispatch({
      type: 'start/getFlowInfo',
      payload: {
        id,
      },
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit', this.state.formData);
    const { formData } = this.state;
    let hasError = '';
    const newFormData = { ...formData };
    Object.keys(formData).forEach(key => {
      const curData = formData[key];
      const formItem = { ...curData };
      const { isGrid } = curData;
      if (isGrid) {
        const errorMsg = this.doValidator(curData);
        hasError = hasError || errorMsg;
        formItem.errorMsg = errorMsg;
        const { value } = formItem;
        const newValue = value.map(item => {
          const newValueItem = { ...item };
          Object.keys(item).forEach(itemKey => {
            const curGridItemValue = item[itemKey];
            const msg = this.doValidator(curGridItemValue);
            hasError = hasError || msg;
            newValueItem[itemKey] = { ...curGridItemValue, errorMsg: msg };
          });
          return newValueItem;
        });
        formItem.value = [...newValue];
        newFormData[key] = {
          ...formItem,
        };
      } else {
        const msg = this.doValidator(curData);
        hasError = hasError || msg;
        newFormData[key] = {
          ...formItem,
          errorMsg: msg,
        };
      }
    });
    this.setState({
      formData: newFormData,
    });
    console.log(newFormData);
    return hasError;
  };

  doValidator = curData => {
    const { value, required, validator, name } = curData;
    if (required && !judgeIsNothing(value)) {
      return `${name}不能为空`;
    }
    if (validator) {
      return validator();
    }
    return '';
  };

  render() {
    const { startDetails } = this.props;
    console.log(this.props, startDetails);
    const startflow = startDetails[this.id] || null;
    return (
      <div style={{ maxWidth: '900px', overflowX: 'scroll' }}>
        <EditForm
          startflow={startflow}
          ref={r => {
            this.form = r;
          }}
          formData={this.state.formData}
          onChange={data => this.setState({ formData: data })}
        />
        <Button type="primary" onClick={this.handleSubmit}>
          提交
        </Button>
      </div>
    );
  }
}
export default StartForm;
