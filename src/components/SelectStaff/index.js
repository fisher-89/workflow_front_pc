import React, { PureComponent } from 'react';
import { Tag } from 'antd';
import { connect } from 'dva';
import StaffModal from './StaffModal';
import style from './index.less';

@connect()
class SelectStaff extends PureComponent {
  constructor(props) {
    super(props);
    const { value } = this.props;
    this.state = {
      value,
      visible: false,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    if (JSON.stringify(value) !== JSON.stringify(this.props.value)) {
      this.setState({
        value,
      });
    }
  }

  onClose = e => {
    e.preventDefault();
    // this.setState({
    //   visible: false
    // })
  };

  onMaskChange = (visible, value) => {
    this.setState({
      visible,
      value,
    });
  };

  handleClick = () => {
    this.setState({
      visible: true,
    });
    this.fetchDataSource({ page: 1, pagesize: 12, filters: { search: '' } });
  };

  fetchDataSource = params => {
    if (this.props.fetchDataSource) {
      this.props.fetchDataSource(params);
    }
  };

  render() {
    const { selfStyle } = this.props;
    const { value } = this.state;
    return (
      <div>
        <div className={style.result} style={{ ...selfStyle }} onClick={this.handleClick}>
          <div className={style.tagItem} onClick={this.onClose}>
            {value.map(item => (
              <Tag closable key={item.staff_sn} onClose={this.onClose}>
                {item.realname}
              </Tag>
            ))}
          </div>
        </div>
        <StaffModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          checkedStaff={value}
          fetchDataSource={this.fetchDataSource}
        />
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  name: { text: 'realname', value: 'staff_sn' },
};
export default SelectStaff;
