import React, { PureComponent } from 'react';
import { Tag } from 'antd';
import { connect } from 'dva';
import StaffModal from './StaffModal';
import style from './index.less';

@connect()
class SelectStaff extends PureComponent {
  constructor(props) {
    super(props);
    const { value, multiple } = this.props;
    this.state = {
      value,
      visible: false,
    };
    this.multiple = multiple;
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
    e.stopPropagation();
    // this.setState({
    //   visible: false
    // })
  };

  onDelete = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const { value } = this.state;
    const newValue = this.multiple ? value.filter(v => v.staff_sn !== item.staff_sn) : '';
    this.setState(
      {
        value: newValue,
      },
      () => {
        this.props.onChange(newValue);
      }
    );
  };

  onMaskChange = (visible, value) => {
    this.setState(
      {
        visible,
        value,
      },
      () => {
        this.props.onChange(value);
      }
    );
  };

  handleClick = e => {
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
    const { selfStyle, multiple } = this.props;
    const { value } = this.state;
    let newValue;
    if (value) {
      newValue = multiple ? value : [value];
    } else {
      newValue = [];
    }
    return (
      <div>
        <div className={style.result} style={{ ...selfStyle }} onClick={this.handleClick}>
          <div className={style.tagItem} onClick={this.onClose}>
            {newValue.map(item => (
              <Tag closable key={item.staff_sn} onClose={e => this.onDelete(e, item)}>
                {item.realname}
              </Tag>
            ))}
          </div>
        </div>
        <StaffModal
          visible={this.state.visible}
          onChange={this.onMaskChange}
          multiple={multiple}
          checkedStaff={newValue}
          fetchDataSource={this.fetchDataSource}
        />
      </div>
    );
  }
}
SelectStaff.defaultProps = {
  name: { realnme: 'text', staff_sn: 'value' },
  onChange: () => {},
};
export default SelectStaff;
