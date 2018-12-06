import React, { PureComponent } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

class Picker extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = this.props;
    this.state = {
      value,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (value && this.props.value) {
      if (value.format('YYYY-MM-DD HH:mm:ss') !== this.props.value.format('YYYY-MM-DD HH:mm:ss')) {
        this.setState({ value });
      }
    }
    if (!(!value && !this.props.value)) {
      this.setState({ value: value || null });
    }
  }

  disabledDate = current => {
    const {
      range: { max, min },
    } = this.props;
    let minDis = false;
    let maxDis = false;
    if (max) {
      maxDis = current && moment(current.format('YYYY-MM-DD')).isAfter(max, 'day');
    }
    if (min) {
      minDis = current && moment(current.format('YYYY-MM-DD')).isBefore(min, 'day');
    }
    return minDis || maxDis;
  };

  handleOnChange = (date, dateString) => {
    const { onChange } = this.props;
    this.setState(
      {
        value: date,
      },
      () => {
        onChange(dateString);
      }
    );
  };

  makeNewProps = () => {
    const props = { ...this.props };
    props.value = this.state.value;
    props.onChange = this.handleOnChange;
    props.disabledDate = this.disabledDate;
    return props;
  };

  render() {
    const props = this.makeNewProps();
    return <DatePicker {...props} />;
  }
}

export default Picker;
