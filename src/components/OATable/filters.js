import React, { PureComponent } from 'react';
import { Switch, Checkbox } from 'antd';

export default class TreeFilter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: [],
      checkAll: false,
    };
  }

  handleChange = value => {
    this.setState({ value });
  };

  handleSwitchOnChange = checked => {
    const { filters } = this.props;
    const value = checked ? filters.map(item => item.value) : [];
    this.setState({ checkAll: checked, value });
  };

  handleReset = () => {
    const { handleConfirm } = this.props;
    this.setState({ value: [] }, handleConfirm([]));
  };

  render() {
    const { handleConfirm, filters } = this.props;
    const { checkAll, value } = this.state;
    return (
      <div className="ant-table-filter-dropdown ant-table-tree-filter">
        <div className="table-filter-title">
          <span>全选: </span>
          <Switch size="small" checked={checkAll} onChange={this.handleSwitchOnChange} />
        </div>
        <div
          className="scroll-bar"
          style={{ maxHeight: 208, padding: '0 10px', minWidth: 100, marginBottom: 10 }}
        >
          <Checkbox.Group value={value} onChange={this.handleChange}>
            {filters.map(item => (
              <div key={item.value} style={{ marginTop: 10 }}>
                <Checkbox
                  disabled={item.disabled === true}
                  value={item.value}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {item.text}
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </div>
        <div className="ant-table-filter-dropdown-btns">
          <a
            className="ant-table-filter-dropdown-link confirm"
            onClick={() => handleConfirm(value)}
          >
            确定
          </a>
          <a className="ant-table-filter-dropdown-link clear" onClick={() => this.handleReset()}>
            重置
          </a>
        </div>
      </div>
    );
  }
}
