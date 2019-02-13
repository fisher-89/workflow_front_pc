import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Steps, Button } from 'antd';
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
    current: 0,
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
    type: 'start',
    handlePrevStep: () => {
      this.stepChange(0);
    },
    handleSubmit: () => {
      this.stepChange(2);
    },
  });

  makeBtns = () => (
    <div>
      <Button type="primary" onClick={() => this.props.history.replace('/available_flow')}>
        再次发起
      </Button>
      <span style={{ marginRight: '20px' }} />
      <Button onClick={() => this.props.history.replace('/start_list')}>查看列表</Button>
    </div>
  );

  render() {
    const { current } = this.state;
    const steps = [
      { title: '第一步', content: <PresetForm parProps={this.makeProps()} /> },
      { title: '第二步', content: <SubmitForm parProps={this.makeSteps2Props()} /> },
      {
        title: '结果',
        content: (
          <div style={{ paddingTop: '50px' }}>
            <Result type="success" title="提交成功" actions={this.makeBtns()} />
          </div>
        ),
      },
    ];
    return (
      <div style={{ maxWidth: '1226px', paddingRight: '24px', paddingBottom: '20px' }}>
        <Steps size="small" current={current}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <div style={{ marginTop: '30px' }}>{steps[current].content}</div>
      </div>
    );
  }
}
export default Sumbit;
