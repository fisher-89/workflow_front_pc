import React, { PureComponent } from 'react';
import { Select } from 'antd';

const { Option } = Select;
class SelectComp extends PureComponent {
  constructor(props) {
    super(props);
    const { value, mode } = props;
    this.state = {
      value: mode === 'multiple' ? (value || []).map(item => `${item || ''}`) : `${value}`,
    };
  }

  componentWillReceiveProps(props) {
    const { value, mode } = props;

    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        value: mode === 'multiple' ? (value || []).map(item => `${item || ''}`) : `${value}`,
      });
    }
  }

  handleOnChange = v => {
    const { onChange } = this.props;
    this.setState({ value: v || '' }, () => {
      onChange(v || '');
    });
  };

  renderOptions = () => {
    const {
      options,
      name: { value, text },
    } = this.props;
    return options.map(item => (
      <Option value={`${item[value]}`} key={item[value]}>
        {item[text]}
      </Option>
    ));
  };

  render() {
    const { value } = this.state;
    return (
      <Select {...this.props} value={value} onChange={this.handleOnChange}>
        {this.renderOptions()}
      </Select>
    );
  }
}
SelectComp.defaultProps = {
  name: {
    value: 'value',
    text: 'text',
  },
  allowClear: true,
  onChange: () => {},
};
export default SelectComp;
