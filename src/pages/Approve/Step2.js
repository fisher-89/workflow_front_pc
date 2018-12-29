import React, { PureComponent } from 'react';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import { FormItem, SelectStaffItem, TextItem } from '../../components/Form/index';
import style from '../Flows/index.less';

@connect(({ start, loading }) => ({
  preStepData: start.preStepData,
  submitLoading: loading.effects['start/stepStart'],
}))
class Step2 extends PureComponent {
  constructor(props) {
    super(props);
    const { preStepData } = props;
    const formData = this.makeStepData(preStepData);
    this.state = {
      formData,
    };
  }

  makeStepData = preStepData => {
    const availableSteps = preStepData.available_steps;
    const steps = availableSteps.map(step => {
      const temp = {
        key: 'approvers',
        name: step.name,
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
      require: true,
      isGrid: true,
      value: steps,
    };
    const formData = {
      next_step: nextStep,
    };
    if (preStepData.is_cc === '1') {
      formData.cc_person = {
        key: 'cc_person',
        value: [...preStepData.cc_person],
        errorMsg: '',
      };
    }
    formData.remark = {
      key: 'remark',
      value: '',
      errorMsg: '',
    };

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
    const params = {
      step_run_id: preStepData.step_run_id,
      timestamp: preStepData.timestamp,
      ...submitFormData,
      flow_id: preStepData.flow_id,
      host: `${window.location.origin}/approve?source=dingtalk`,
      cc_host: `${window.location.origin}/cc_detail?source=dingtalk`,
    };
    if (!hasError) {
      const { dispatch } = this.props;
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
    const submitFormData = {};
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

  renderSteps = () => {
    const { formData } = this.state;
    const { preStepData } = this.props;
    const stepItem = { ...this.makeProps(), asideStyle: { width: '90px' } };
    const isEnd =
      (preStepData.step_end === 1 && preStepData.available_steps.length) ||
      (preStepData.step_end === 0 && !preStepData.available_steps.length);
    const concurrentType = preStepData.concurrent_type;
    return (
      <FormItem
        {...{
          name: '执行步骤',
          errorMsg: formData.next_step.errorMsg,
          required: true,
          width: 690,
          extraStyle: { height: 'auto' },
          asideStyle: { width: '90px' },
        }}
      >
        {!isEnd &&
          formData.next_step.value.map((step, i) => {
            const cls = classNames(style.step2_item, {
              [style.checked]: step.checked && concurrentType === 1,
              [style.disabed_checked]: step.checked && concurrentType === 2,
              [style.singelchecked]: step.checked && concurrentType === 0,
            });
            const key = i;
            return (
              <div className={cls} key={key} onClick={e => this.handleClick(step, i, e)}>
                <FormItem name="步骤名称" {...stepItem}>
                  <div style={{ lineHeight: '40px' }}>哈哈</div>
                </FormItem>
                <SelectStaffItem {...this.makeApproProps(step, i)} />
              </div>
            );
          })}
      </FormItem>
    );
  };

  render() {
    const { submitLoading } = this.props;
    return (
      <Spin spinning={submitLoading || false}>
        <div className={style.step2}>
          <div>
            {this.renderSteps()}
            <SelectStaffItem {...this.makeCCProps()} />
            <TextItem {...this.makeRemarkProps()} />
            <div style={{ marginLeft: '90px' }}>
              <Button type="primary" onClick={this.handleSubmit}>
                提交
              </Button>
              <span style={{ marginRight: '20px' }} />
              <Button onClick={this.handlePrev}>上一步</Button>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
export default Step2;
