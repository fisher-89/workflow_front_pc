import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Steps } from 'antd';
import PresetForm from './StartForm';
import SubmitForm from './Step2';

const { Step } = Steps;

@connect(({ start, loading }) => ({
  startDetails: start.flowDetails,
  startLoading: loading.effects['start/getFlowInfo'],
  presetSubmit: loading.effects['start/preSet'],
}))
class Sumbit extends PureComponent {
  state = {
    current: 1,
  };

  stepChange = current => {
    this.setState({
      current,
    });
  };

  makeProps = index => ({
    ...this.props,
    stepChange: v => {
      this.stepChange(index);
    },
  });

  makeSteps2Props = () => {};

  render() {
    const { current } = this.state;
    const steps = [
      { title: '第一步', content: <PresetForm parProps={this.makeProps(1)} /> },
      { title: '第二步', content: <SubmitForm parProps={this.makeProps(2)} /> },
      { title: '结果', content: 'result' },
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
