import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Steps, Button } from 'antd';
import Step1 from './Step1';
import Step2 from '../Flows/Step2';
import Result from '../../components/Result/index';

const { Step } = Steps;

@connect(({ approve }) => ({
  approveDetails: approve.approveDetails,
}))
class Sumbit extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { id },
      },
    } = props;
    this.state = {
      current: 0,
      type: 'approve',
    };
    this.id = id;
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'approve/fetchStepInfo',
      payload: {
        id: this.id,
      },
    });
    dispatch({
      type: 'start/fetchFlowSteps',
      payload: {
        id: this.id,
      },
    });
  }

  stepChange = current => {
    this.setState({
      current,
    });
  };

  makeStep1Props = () => ({
    ...this.props,
    id: this.id,
    handleSubmit: type => {
      this.setState(
        {
          type,
        },
        () => {
          this.stepChange(1);
        }
      );
    },
  });

  makeSteps2Props = () => ({
    ...this.props,
    type: this.state.type,
    handlePrevStep: () => {
      this.stepChange(0);
    },
    handleSubmit: () => {
      this.stepChange(2);
    },
  });

  makeBtns = () => (
    <div>
      <Button onClick={() => this.props.history.replace('/approvelist')}>查看列表</Button>
    </div>
  );

  render() {
    const { current } = this.state;
    const steps = [
      { title: '第一步', content: <Step1 parProps={this.makeStep1Props()} /> },
      { title: '第二步', content: <Step2 parProps={this.makeSteps2Props()} /> },
      {
        title: '结果',
        content: (
          <div style={{ paddingTop: '50px' }}>
            <Result type="success" title="操作成功" actions={this.makeBtns()} />
          </div>
        ),
      },
    ];
    const startflow = this.props.approveDetails[this.id] || null;
    return (
      <div style={{ maxWidth: '926px', paddingRight: '24px', paddingBottom: '20px' }}>
        {startflow && startflow.step_run.action_type === 0 ? (
          <Steps size="small" current={current}>
            {steps.map(step => (
              <Step key={step.title} title={step.title} />
            ))}
          </Steps>
        ) : null}
        <div style={{ marginTop: startflow && startflow.step_run.action_type === 0 ? '30px' : 0 }}>
          {steps[current].content}
        </div>
      </div>
    );
  }
}
export default Sumbit;
