import React, { PureComponent } from 'react';
import { TimePicker } from 'antd';
import moment from 'moment';

class Time extends PureComponent {
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
      if (value.format('HH:mm:ss') !== this.props.value.format('HH:mm:ss')) {
        this.setState({ value });
      }
    }
    if (!(!value && !this.props.value)) {
      this.setState({ value: value || null });
    }
  }

  range = (start, end) => {
    const range = [];
    for (let i = start; i <= end; i += 1) {
      range.push(i);
    }
    return range;
  };

  dealDisTimeHms = (min, max) => {
    const maxTime = max ? this.splitTime(max) : { h: 23, m: 59, s: 59 };
    const minTime = min ? this.splitTime(min) : { h: 0, m: 0, s: 0 };
    return {
      maxTime,
      minTime,
    };
  };

  splitTime = time => ({
    h: time.slice(0, 2) - 0,
    m: time.slice(3, 5) - 0,
    s: time.slice(-2) - 0,
  });

  disabledHours = () => {
    const {
      range: { max, min },
    } = this.props;
    const { minTime, maxTime } = this.dealDisTimeHms(min, max);
    const range = this.range(1, 24);
    return range.slice(0, minTime.h === 0 ? 0 : minTime.h - 1).concat(range.slice(maxTime.h));
  };

  disabledMinutes = h => {
    const {
      range: { max, min },
    } = this.props;
    const { minTime, maxTime } = this.dealDisTimeHms(min, max);
    const range = this.range(0, 59);
    let minDis = [];
    let maxDis = [];
    if (h === minTime.h) {
      minDis = range.slice(0, minTime.m);
    } else if (h < minTime.h) {
      minDis = [...range];
    } else {
      minDis = [];
    }
    if (h === maxTime.h) {
      maxDis = range.slice(maxTime.m + 1);
    } else if (h > maxTime.h) {
      maxDis = [...range];
    } else {
      maxDis = [];
    }
    const disRange = minDis.concat(maxDis);
    return disRange;
  };

  disabledSeconds = (h, m) => {
    const {
      range: { max, min },
    } = this.props;
    const { minTime, maxTime } = this.dealDisTimeHms(min, max);
    const range = this.range(0, 59);
    let minDis = [];
    let maxDis = [];
    const time = `${h}${m}`;
    const minHs = `${minTime.h}${minTime.m}`;
    const maxHs = `${maxTime.h}${maxTime.m}`;
    if (time === minHs) {
      minDis = range.slice(0, minTime.s);
    } else if (time < minHs) {
      minDis = [...range];
    } else {
      minDis = [];
    }
    if (time === maxHs) {
      maxDis = range.slice(maxTime.s + 1);
    } else if (time > maxHs) {
      maxDis = [...range];
    } else {
      maxDis = [];
    }
    const disRange = minDis.concat(maxDis);
    return disRange;
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
    props.disabledHours = this.disabledHours;
    props.disabledMinutes = this.disabledMinutes;
    props.disabledSeconds = this.disabledSeconds;
    return props;
  };

  render() {
    const props = this.makeNewProps();
    return <TimePicker {...props} size="large" />;
  }
}

export default Time;
