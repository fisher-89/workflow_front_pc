import React, { PureComponent } from 'react';
import { Button } from 'antd';
import { connect } from 'dva';
import { judgeIsNothing } from '../../utils/utils';
import { EditForm } from '../../components/Form/index';
import style from './index.less';

const tempformData = {
  file: [],
  number: null,
  area: [],
  single: '给',
  multi: ['发', '额'],
  arra: ['2', '5'],
  interface: '7',
  interfaces: ['292'],
  date: '2018-11-01',
  text: '',
  grid: [
    {
      interface: '4',
      interfaces: [],
      files: [],
      time: null,
    },
  ],
};
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
    const data = this.submitValidator();
    const { hasError, submitFormData } = data;
    if (!hasError) {
      const { dispatch, startDetails } = this.props;
      const startflow = startDetails[this.id];
      dispatch({
        type: 'start/preSet',
        payload: {
          data: {
            form_data: submitFormData,
            flow_id: startflow.step.flow_id,
          },
          cb: response => {
            const { status, errors } = response;
            if (status === 422) {
              this.serverValidate(errors);
            }
            // history.push('/select_step');
            // history.push('/approve_step');
          },
        },
      });
    }
  };

  serverValidate = errors => {
    const { formData } = this.state;
    const prefix = 'form_data';
    const newFormData = { ...formData };
    Object.keys(formData).forEach(key => {
      const curData = formData[key];
      const formItem = { ...curData };
      const { isGrid } = curData;
      const str = `${prefix}.${key}`;
      if (isGrid) {
        let msg = '';
        if (errors[str]) {
          msg = errors[str].join('');
          formItem.errorMsg = msg;
        }
        const { value } = formItem;
        const newValue = value.map((item, i) => {
          const gridStr = `${str}.${i}`;
          const newValueItem = { ...item };
          const submitValue = {};
          Object.keys(item).forEach(itemKey => {
            const gridItemStr = `${gridStr}.${itemKey}`;
            const curGridItemValue = item[itemKey];
            submitValue[itemKey] = curGridItemValue.value;
            let gridMsg = '';
            if (errors[gridItemStr]) {
              gridMsg = errors[gridItemStr].join('');
              newValueItem[itemKey] = { ...curGridItemValue, errorMsg: gridMsg };
            }
          });
          return newValueItem;
        });
        formItem.value = [...newValue];
        newFormData[key] = {
          ...formItem,
        };
      } else {
        let msg = '';
        if (errors[str]) {
          msg = errors[str].join('');
          newFormData[key] = {
            ...formItem,
            errorMsg: msg,
          };
        }
      }
    });
    this.setState({
      formData: newFormData,
    });
  };

  submitValidator = () => {
    const { formData } = this.state;
    let hasError = '';
    const newFormData = { ...formData };
    const submitFormData = {};
    Object.keys(formData).forEach(key => {
      const curData = formData[key];
      const formItem = { ...curData };
      const { isGrid } = curData;
      if (isGrid) {
        const errorMsg = this.doValidator(curData);
        hasError = hasError || errorMsg;
        formItem.errorMsg = errorMsg;
        const { value } = formItem;
        const gridValue = [];
        const newValue = value.map(item => {
          const newValueItem = { ...item };
          const submitValue = {};
          Object.keys(item).forEach(itemKey => {
            const curGridItemValue = item[itemKey];
            submitValue[itemKey] = curGridItemValue.value;

            const msg = this.doValidator(curGridItemValue);
            hasError = hasError || msg;
            newValueItem[itemKey] = { ...curGridItemValue, errorMsg: msg };
          });
          gridValue.push(submitValue);
          return newValueItem;
        });
        formItem.value = [...newValue];
        newFormData[key] = {
          ...formItem,
        };
        submitFormData[key] = gridValue;
        // submitFormData[key] = []
      } else {
        const msg = this.doValidator(curData);
        hasError = hasError || msg;
        newFormData[key] = {
          ...formItem,
          errorMsg: msg,
        };
        submitFormData[key] = formItem.value;
      }
    });
    this.setState({
      formData: newFormData,
    });
    return { hasError, submitFormData };
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
    const startflow = startDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }
    return (
      <div style={{ maxWidth: '900px', overflowX: 'scroll' }}>
        <div className={style.clearfix}>
          <span className={style.flow_title}>流程名称</span>
          <span className={style.flow_des}>{startflow.flow.name}</span>
        </div>
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
