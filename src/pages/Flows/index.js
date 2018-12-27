import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Steps } from 'antd';
import PresetForm from './StartForm';
import SubmitForm from './Step2';
import Result from '../../components/Result/index';

const { Step } = Steps;

@connect(({ start, loading }) => ({
  startDetails: start.flowDetails,
  startLoading: loading.effects['start/getFlowInfo'],
  presetSubmit: loading.effects['start/preSet'],
}))
class Sumbit extends PureComponent {
  state = {
    current: 2,
  };

  stepChange = current => {
    this.setState({
      current,
    });
  };

  makeProps = () => ({
    ...this.props,
    handleSubmit: () => {
      this.stepChange(1);
    },
  });

  makeSteps2Props = () => ({
    ...this.props,
    handlePrevStep: () => {
      this.stepChange(0);
    },
    handleSubmit: () => {
      this.stepChange(2);
    },
  });

  render() {
    const { current } = this.state;
    const steps = [
      { title: '第一步', content: <PresetForm parProps={this.makeProps()} /> },
      { title: '第二步', content: <SubmitForm parProps={this.makeSteps2Props()} /> },
      { title: '结果', content: <Result type="success" title="提交成功" /> },
    ];
    return (
      <div style={{ maxWidth: '900px' }}>
        <Steps size="small" current={current}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <div style={{ marginTop: '20px' }}>{steps[current].content}</div>
      </div>
    );
  }
}
export default Sumbit;
