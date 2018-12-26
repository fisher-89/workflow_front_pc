import React, { PureComponent } from 'react';
import { Button, Spin, Form } from 'antd';
import { connect } from 'dva';

import { FormItem, SelectStaffItem, TextItem } from '../../components/Form/index';
import style from './index.less';

@connect(({ start, loading }) => ({
  preStepData: start.preStepData,
  startLoading: loading.effects['start/getFlowInfo'],
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

  componentWillMount() {
    const {
      match: {
        params: { id },
      },
      dispatch,
    } = this.props.parProps;
    this.id = id;
    dispatch({
      type: 'start/getFlowInfo',
      payload: {
        id,
      },
    });
  }

  makeStepData = preStepData => {
    const availableSteps = preStepData.available_steps;
    const steps = availableSteps.map(step => {
      const temp = {
        checked: preStepData.concurrent_type === 2,
        id: step.id,
        key: 'approvers',
        name: step.name,
        value: {},
        errorMsg: '',
      };
      return temp;
    });
    const nextStep = {
      key: 'next_step',
      errorMsg: '',
      name: '执行步骤',
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

  approverChange = (v, msg) => {
    console.log('v,msg: ', v, msg);
  };

  makeProps = () => ({
    name: '步骤名称',
    width: '600',
  });

  makeApproProps = item => {
    const field = {
      is_checkbox: false,
      available_options: [],
      width: 600,
      name: '审批人',
    };
    return {
      required: true,
      // errorMsg:'',
      field,
      asideStyle: { width: '90px' },
      name: { realname: 'staff_name', staff_sn: 'staff_sn' },
      value: item.value,
      errorMsg: item.errorMsg,
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg),
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
      name: { realname: 'staff_name', staff_sn: 'staff_sn' },
      field,
      asideStyle: { width: '90px' },
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg),
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
      onChange: (value, errorMsg) => this.approverChange(value, errorMsg),
    };
  };

  render() {
    const { formData } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 22 },
      },
    };
    const stepItem = { ...this.makeProps(), asideStyle: { width: '90px' } };
    return (
      <div className={style.step2}>
        <div>
          <Form.Item label="执行步骤" {...formItemLayout}>
            {formData.next_step.value.map(step => (
              <div className={style.step2_item} key={step.id}>
                <FormItem name="步骤名称" {...stepItem}>
                  <div style={{ lineHeight: '40px' }}>{step.name}</div>
                </FormItem>
                <SelectStaffItem {...this.makeApproProps(step)} />
              </div>
            ))}
          </Form.Item>
          <SelectStaffItem {...this.makeCCProps()} />
          <TextItem {...this.makeRemarkProps()} />
          <div style={{ marginLeft: '90px' }}>
            <Button type="primary">提交</Button>
            <span style={{ marginRight: '20px' }} />
            <Button>上一步</Button>
          </div>
        </div>
      </div>
    );
  }
}
export default Step2;
