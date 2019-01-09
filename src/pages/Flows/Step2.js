import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import { judgeIsNothing } from '../../utils/utils';
import { FormItem, SelectStaffItem, TextItem } from '../../components/Form/index';
import style from './index.less';

@connect(({ start, loading, approve }) => ({
  preStepData: start.preStepData,
  approveDetails: approve.approveDetails,
  startDetails: start.approveDetails,
  loading,
  submitLoading:
    loading.effects['start/stepStart'] ||
    loading.effects['approve/getThrough'] ||
    loading.effects['approve/doDeliver'] ||
    loading.effects['approve/doReject'] ||
    false,
}))
class Step2 extends PureComponent {
  constructor(props) {
    super(props);
    const {
      preStepData,
      approveDetails,
      parProps: {
        match: {
          params: { id },
        },
      },
    } = props;
    const formData = this.makeStepData(preStepData);
    this.id = id;
    this.startflow = approveDetails[this.id] || null;
    this.state = {
      formData,
    };
  }

  makeStepData = preStepData => {
    const {
      parProps: { type },
    } = this.props;
    const formData = {
      remark: {
        key: 'remark',
        value: '',
        errorMsg: '',
      },
    };
    if (type === 'start' || type === 'approve') {
      if (preStepData.available_steps.length && preStepData.step_end === 0) {
        const availableSteps = preStepData.available_steps;
        const steps = availableSteps.map(step => {
          const temp = {
            key: 'approvers',
            name: '审批人',
            value: {},
            errorMsg: '',
            id: step.id,
          };
          return { checked: preStepData.concurrent_type === 2, approvers: temp };
        });
        const nextStep = {
          key: 'next_step',
          errorMsg: '',
          name: '执行步骤',
          required: true,
          isGrid: true,
          value: steps,
        };
        formData.next_step = nextStep;
      }
      if (preStepData.is_cc === '1') {
        formData.cc_person = {
          key: 'cc_person',
          value: [...preStepData.cc_person],
          errorMsg: '',
        };
      }
    }
    if (type === 'deliver') {
      formData.deliver = {
        key: 'deliver',
        required: true,
        name: '转交人',
        value: '',
        errorMsg: '',
      };
    }
    return formData;
  };

  approverChange = (v, msg, keyInfo) => {
    if (keyInfo.isGrid) {
      this.gridOnChange(v, msg, keyInfo);
    } else {
      this.formOnChange(v, msg, keyInfo);
    }
  };

  gridOnChange = (value, errorMsg, keyInfo) => {
    const { gridKey, index, childKey } = keyInfo;
    const { formData } = this.state;
    const gridValueInfo = formData[gridKey];
    const curGridInfo = { ...gridValueInfo.value[index] };
    const newGridItem = { ...curGridInfo[childKey] };
    newGridItem.value = value;
    newGridItem.errorMsg = errorMsg;
    curGridInfo[childKey] = { ...newGridItem };
    const newGridValue = gridValueInfo.value.map((item, i) => {
      let newItem = { ...item };
      if (i === index) {
        newItem = { ...curGridInfo };
      }
      return newItem;
    });
    const newFormData = {
      ...formData,
      [gridKey]: { ...gridValueInfo, value: newGridValue },
    };
    this.setState({
      formData: {
        ...newFormData,
      },
    });
  };

  formOnChange = (value, errorMsg, keyInfo) => {
    const { formKey } = keyInfo;
    const { formData } = this.state;
    const curValueInfo = formData[formKey];
    const newValueInfo = {
      ...curValueInfo,
      errorMsg,
      value,
    };
    this.setState({
      formData: {
        ...formData,
        [formKey]: newValueInfo,
      },
    });
  };

  makeProps = () => ({
    name: '步骤名称',
    width: '410',
  });

  makeApproProps = (item, i) => {
    const field = {
      is_checkbox: false,
      available_options: [],
      width: 300,
      name: '审批人',
    };
    return {
      required: item.checked,
      field,
      asideStyle: { width: '90px' },
      itemStyle: { width: '290px' },
      formName: { realname: 'approver_name', staff_sn: 'approver_sn' },
      value: item.approvers.value,
      errorMsg: item.approvers.errorMsg,
      onChange: (value, errorMsg) =>
        this.approverChange(value, errorMsg, {
          isGrid: true,
          childKey: 'approvers',
          index: i,
          gridKey: 'next_step',
        }),
    };
  };

  makeCCProps = () => {
    const { preStepData } = this.props;
    const { formData } = this.state;
    const cc = formData.cc_person;
    const field = {
      is_checkbox: 1,
      available_options: [],
      width: 600,
      name: '抄送人',
    };
    return {
      value: cc.value,
      defaultValue: preStepData.cc_person,
      errorMsg: cc.errorMsg,
      formName: { realname: 'staff_name', staff_sn: 'staff_sn' },
      field,
      asideStyle: { width: '90px' },
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg, { formKey: 'cc_person' }),
    };
  };

  makeDeliverProps = () => {
    const { formData } = this.state;
    const person = formData.deliver;
    const field = {
      width: 600,
      name: '转交人',
    };
    return {
      value: person.value,
      errorMsg: person.errorMsg,
      required: true,
      formName: { realname: 'approver_name', staff_sn: 'approver_sn' },
      field,
      asideStyle: { width: '90px' },
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg, { formKey: 'deliver' }),
    };
  };

  makeRemarkProps = () => {
    const field = {
      width: 600,
      name: '备注',
      max: 200,
      type: 'text',
      height: '150',
    };
    return {
      field,
      asideStyle: { width: '90px' },
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg, { formKey: 'remark' }),
    };
  };

  handleClick = (step, i, e) => {
    e.stopPropagation();
    const { preStepData } = this.props;
    const { formData } = this.state;
    const nextStep = { ...formData.next_step };
    const concurrentType = preStepData.concurrent_type;
    const items = nextStep.value;
    let newItems = [...items];
    let errorMsg = '';
    if (!nextStep.value.find(item => item.checked)) {
      errorMsg = preStepData.concurrent_type === 0 ? '请任选一个步骤' : '请至少选择一个步骤';
    }
    if (concurrentType === 1) {
      // 多选
      newItems = items.map((item, index) => {
        let obj = {};
        if (index === i) {
          obj = { ...item };
          obj.checked = !item.checked;
          obj.approvers.required = !item.checked;
        } else {
          obj = { ...item };
        }
        return obj;
      });
    } else if (concurrentType === 0) {
      // 单选
      newItems = items.map((item, index) => {
        let obj = { ...item };
        if (index === i) {
          obj = { ...item };
          obj.checked = 1;
          obj.approvers.required = true;
        }
        return obj;
      });
    }
    nextStep.errorMsg = !newItems.find(item => item.checked) ? errorMsg : '';
    nextStep.value = [...newItems];
    this.setState({
      formData: { ...formData, next_step: nextStep },
    });
  };

  handlePrev = e => {
    e.preventDefault();
    this.setState({ formData: {} });
    this.props.parProps.handlePrevStep();
  };

  handleSubmit = e => {
    e.preventDefault();
    const data = this.submitValidator();
    const {
      preStepData,
      parProps: { handleSubmit },
    } = this.props;
    const { hasError, submitFormData } = data;

    if (!hasError) {
      const { dispatch } = this.props;
      const params = {
        step_run_id: preStepData.step_run_id,
        timestamp: preStepData.timestamp,
        ...submitFormData,
        flow_id: preStepData.flow_id,
        host: `${window.location.origin}/approve?source=dingtalk`,
        cc_host: `${window.location.origin}/cc_detail?source=dingtalk`,
      };
      dispatch({
        type: 'start/stepStart',
        payload: {
          data: {
            ...params,
          },
          cb: () => {
            handleSubmit();
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
    const { preStepData } = this.props;
    let hasError = '';
    const newFormData = { ...formData };
    let submitFormData = {};
    Object.keys(formData).forEach(key => {
      const curData = formData[key];
      const oldErrorMsg = curData.errorMsg;
      const formItem = { ...curData };
      const { isGrid } = curData;
      if (isGrid) {
        let errorMsg = '';
        if (oldErrorMsg) {
          errorMsg = oldErrorMsg;
        } else if (!curData.value.find(item => item.checked)) {
          errorMsg = preStepData.concurrent_type === 0 ? '请任选一个步骤' : '请至少选择一个步骤';
        } else {
          errorMsg = this.doValidator(curData);
        }
        hasError = hasError || errorMsg;
        formItem.errorMsg = errorMsg;
        const { value } = formItem;
        const gridValue = [];
        const newValue = value.map(item => {
          const newValueItem = { ...item };
          const curGridItemValue = item.approvers;
          if (item.checked) {
            const submitValue = { ...curGridItemValue.value, step_id: curGridItemValue.id };
            gridValue.push(submitValue);
          }
          const msg = oldErrorMsg || this.doValidator(curGridItemValue);

          hasError = hasError || msg;
          newValueItem.approvers = { ...curGridItemValue, errorMsg: msg };
          return newValueItem;
        });
        formItem.value = [...newValue];
        newFormData[key] = {
          ...formItem,
        };
        submitFormData[key] = gridValue;
      } else {
        const msg = oldErrorMsg || this.doValidator(curData);
        hasError = hasError || msg;
        if (key === 'deliver') {
          submitFormData = { ...submitFormData, ...formItem.value };
        } else {
          newFormData[key] = {
            ...formItem,
            errorMsg: msg,
          };
          submitFormData[key] = formItem.value;
        }
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

  pass = () => {
    const { hasError, submitFormData } = this.submitValidator();
    if (!hasError) {
      const {
        dispatch,
        parProps: { handleSubmit },
        preStepData,
      } = this.props;
      dispatch({
        type: 'approve/getThrough',
        payload: {
          params: {
            ...submitFormData,
            host: `${window.location.origin}/approve?source=dingtalk`,
            step_run_id: preStepData.step_run_id,
            timestamp: preStepData.timestamp,
            flow_id: preStepData.flow_id,
            cc_host: `${window.location.origin}/cc_detail?source=dingtalk`,
          },
          cb: () => {
            handleSubmit();
          },
        },
      });
    }
  };

  deliver = () => {
    const { hasError, submitFormData } = this.submitValidator();
    if (!hasError) {
      const {
        dispatch,
        parProps: { handleSubmit },
      } = this.props;

      dispatch({
        type: 'approve/doDeliver',
        payload: {
          params: {
            ...submitFormData,
            step_run_id: this.startflow.step_run.id,
            host: `${window.location.origin}/approve?source=dingtalk`,
          },
          cb: () => {
            handleSubmit();
          },
        },
      });
    }
  };

  reject = () => {
    const { hasError, submitFormData } = this.submitValidator();
    if (!hasError) {
      const {
        dispatch,
        parProps: { handleSubmit },
      } = this.props;
      dispatch({
        type: 'approve/doReject',
        payload: {
          params: {
            ...submitFormData,
            step_run_id: this.startflow.step_run.id,
          },
          cb: () => {
            handleSubmit();
          },
        },
      });
    }
  };

  renderSteps = () => {
    const { formData } = this.state;
    const { preStepData } = this.props;
    const concurrentType = preStepData.concurrent_type;

    const stepItem = { ...this.makeProps(), asideStyle: { width: '90px' } };
    const isEnd = !(preStepData.available_steps.length && preStepData.step_end === 0);
    if (isEnd) {
      return null;
    }
    return (
      <FormItem
        {...{
          name: '执行步骤',
          errorMsg: formData.next_step.errorMsg,
          required: true,
          width: 690,
          extraStyle: { height: 'auto' },
          asideStyle: { width: '90px' },
          rightStyle: { width: '600px', minWidth: '600px' },
        }}
      >
        {formData.next_step.value.map((step, i) => {
          const cls = classNames(style.step2_item, {
            [style.checked]: step.checked && concurrentType === 1,
            [style.disabed_checked]: step.checked && concurrentType === 2,
            [style.singelchecked]: step.checked && concurrentType === 0,
          });
          const key = i;
          const curStep = preStepData.available_steps[i];
          return (
            <div className={cls} key={key} onClick={e => this.handleClick(step, i, e)}>
              <FormItem name="步骤名称" {...stepItem}>
                <div style={{ lineHeight: '40px' }}>{curStep.name}</div>
              </FormItem>
              <SelectStaffItem {...this.makeApproProps(step, i)} />
            </div>
          );
        })}
      </FormItem>
    );
  };

  renderBtn = () => {
    const {
      parProps: { type },
    } = this.props;
    let btn = '';
    if (type === 'start') {
      btn = (
        <Button onClick={this.handleSubmit} type="primary">
          提交
        </Button>
      );
    }
    if (type === 'approve') {
      btn = (
        <Button onClick={this.pass} type="primary">
          通过
        </Button>
      );
    }
    if (type === 'reject') {
      btn = (
        <Button onClick={this.reject} type="primary">
          驳回
        </Button>
      );
    }
    if (type === 'deliver') {
      btn = (
        <Button onClick={this.deliver} type="primary">
          转交
        </Button>
      );
    }
    return btn;
  };

  render() {
    const {
      submitLoading,
      parProps: { type },
      preStepData = {},
    } = this.props;

    return (
      <Spin spinning={submitLoading || false}>
        <div className={style.step2}>
          <div>
            {type !== 'deliver' && type !== 'reject' ? this.renderSteps() : null}
            {type === 'start' && type === 'approve' && preStepData.is_cc === '1' ? (
              <SelectStaffItem {...this.makeCCProps()} />
            ) : null}
            {type === 'deliver' ? <SelectStaffItem {...this.makeDeliverProps()} /> : null}
            {type !== 'start' ? <TextItem {...this.makeRemarkProps()} /> : null}
            <div style={{ marginLeft: '90px' }}>
              {this.renderBtn()}
              <span style={{ marginRight: '20px' }} />
              <Button onClick={this.handlePrev}>上一步</Button>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
Step2.defaultProps = {
  type: 'start',
};
export default Step2;
