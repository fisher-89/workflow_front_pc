import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import { connect } from 'dva';
import { judgeIsNothing } from '../../utils/utils';
import { EditForm } from '../../components/Form/index';
import style from '../Flows/index.less';

@connect(({ approve, loading }) => ({
  approveDetails: approve.approveDetails,
  startLoading: loading.effects['approve/getFlowInfo'],
  presetSubmit: loading.effects['start/preSet'],
}))
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
    } = this.props.parProps;
    this.id = id;
    dispatch({
      type: 'approve/fetchStepInfo',
      payload: id,
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const data = this.submitValidator();
    const { hasError, submitFormData } = data;
    if (!hasError) {
      const {
        dispatch,
        approveDetails,
        parProps: { handleSubmit },
      } = this.props;
      const startflow = approveDetails[this.id];
      dispatch({
        type: 'start/preSet',
        payload: {
          data: {
            form_data: submitFormData,
            flow_id: startflow.step.flow_id,
            step_run_id: startflow.step_run.id,
          },
          cb: response => {
            const { status, errors } = response;
            if (status === 422) {
              this.serverValidate(errors);
            } else {
              handleSubmit('approve');
            }
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
      const oldErrorMsg = curData.errorMsg;
      const formItem = { ...curData };
      const { isGrid } = curData;
      if (isGrid) {
        const errorMsg = oldErrorMsg || this.doValidator(curData);
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
            const msg = oldErrorMsg || this.doValidator(curGridItemValue);
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
        const msg = oldErrorMsg || this.doValidator(curData);
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
    const {
      approveDetails,
      startLoading,
      presetSubmit,
      parProps: { handleSubmit },
    } = this.props;
    const startflow = approveDetails[this.id] || null;
    if (!startflow || !Object.keys(startflow).length) {
      return null;
    }
    return (
      <Spin spinning={startLoading || presetSubmit === true}>
        <div style={{ maxWidth: '900px', paddingBottom: '20px' }}>
          <div className={style.clearfix}>
            <span className={style.flow_title}>流程名称</span>
            <span className={style.flow_des}>{startflow.step.name}</span>
          </div>
          <EditForm
            startflow={startflow}
            ref={r => {
              this.form = r;
            }}
            formData={this.state.formData}
            onChange={data => this.setState({ formData: data })}
          />
          <div style={{ paddingLeft: '120px' }}>
            {startflow.step_run.action_type === 0 && (
              <Button type="primary" onClick={this.handleSubmit}>
                通过
              </Button>
            )}
            <span style={{ marginRight: '20px' }} />
            {startflow.step_run.action_type === 0 && (
              <Button type="primary" onClick={() => handleSubmit('deliver')}>
                转交
              </Button>
            )}
            <span style={{ marginRight: '20px' }} />
            {startflow.step.reject_type !== 0 &&
              startflow.step_run.action_type === 0 && (
                <Button type="primary" onClick={() => handleSubmit('reject')}>
                  驳回
                </Button>
              )}
          </div>
        </div>
      </Spin>
    );
  }
}
export default StartForm;
