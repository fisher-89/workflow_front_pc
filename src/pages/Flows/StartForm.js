import React, { PureComponent } from 'react';
import { Card, Button } from 'antd';
import { connect } from 'dva';
import { EditForm } from '../../components/Form/index';

@connect(({ start }) => ({ startDetails: start.startDetails }))
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
      startDetails,
    } = this.props;
    this.id = id;
    const startflow = startDetails[this.id];
    this.setState({
      startflow,
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log('handleSubmit', this.state.formData);
  };

  render() {
    const { startflow } = this.state;
    return (
      <Card bordered={false}>
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
      </Card>
    );
  }
}
export default StartForm;
