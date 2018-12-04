import React, { PureComponent } from 'react';
import { Select } from 'antd';

const { Option } = Select;
class SingleSelect extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      value,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (value !== this.props.value) {
      this.setState({
        value,
      });
    }
  }

  handleOnChange = v => {
    const { onChange } = this.props;
    this.setState(
      {
        value: v,
      },
      () => {
        onChange(v);
      }
    );
  };

  renderOptions = () => {
    const {
      options,
      name: { value, text },
    } = this.props;
    return options.map(item => (
      <Option value={item[value]} key={item[value]}>
        {item[text]}
      </Option>
    ));
  };

  render() {
    const { value } = this.state;
    return (
      <Select value={value} {...this.props} onChange={this.handleOnChange}>
        {this.renderOptions()}
      </Select>
    );
  }
}
SingleSelect.defaultProps = {
  name: {
    value: 'value',
    text: 'text',
  },
  allowClear: true,
};
export default SingleSelect;
