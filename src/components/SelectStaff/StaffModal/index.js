import React, { PureComponent } from 'react';
import { Pagination, Modal, Spin } from 'antd';
import { debounce } from 'lodash';
import { connect } from 'dva';

import StaffItem from './StaffItem';
import style from './index.less';

@connect(({ staff, loading }) => ({
  source: staff.source,
  fetchLoading: loading.effects['staff/fetchStaffs'],
}))
class StaffModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible, fetchDataSource, checkedStaff, multiple } = this.props;
    this.state = {
      visible,
      searchType: [{ name: '员工', type: 1, checked: 1 }, { name: '部门', type: 2 }],
      checkedStaff,
      swicthVisible: false,
      value: '',
    };
    this.multiple = multiple;
    this.fetchFiltersDataSource = debounce(params => {
      fetchDataSource(params);
    }, 500);
    this.fetchDataSource = fetchDataSource;
  }

  componentWillMount() {
    // const { fetchDataSource } = this.props;
    // this.fetchDataSource();
  }

  componentWillReceiveProps(props) {
    const { visible, checkedStaff } = props;
    if (
      visible !== this.props.visible ||
      JSON.stringify(checkedStaff) !== JSON.stringify(this.props.checkedStaff)
    ) {
      this.setState({
        visible,
        checkedStaff,
      });
    }
  }

  onCancel = () => {
    this.setState(
      {
        visible: false,
        value: '',
        swicthVisible: false,
      },
      () => {
        // this.props.onChange(false, '', false);
      }
    );
  };

  onOk = () => {
    const { checkedStaff } = this.state;
    this.setState(
      {
        visible: false,
        value: '',
        swicthVisible: false,
      },
      () => {
        this.props.onChange(false, this.multiple ? checkedStaff : checkedStaff[0]);
      }
    );
  };

  inputOnChange = e => {
    const { value } = e.target;
    this.setState({
      value,
    });
    this.fetchFiltersDataSource({
      page: 1,
      pagesize: 12,
      filters: value ? `realname~${value}|staff_sn~${value}|department.name~${value}` : '',
    });
  };

  switchSearchType = (item, e) => {
    e.stopPropagation();
    const { searchType } = this.state;
    const newSearchType = searchType.map(t => {
      const newItem = { ...t, checked: false };
      if (t.type === item.type) {
        newItem.checked = true;
      }
      return newItem;
    });
    this.setState({
      searchType: newSearchType,
      swicthVisible: false,
    });
  };

  pageOnChange = page => {
    const { value } = this.state;
    this.fetchDataSource({
      page,
      pagesize: 12,
      filters: {
        realname: { like: value },
      },
    });
  };

  handleOnChange = item => {
    const { checkedStaff } = this.state;
    this.setState({
      checkedStaff: this.multiple ? [...checkedStaff, item].unique('staff_sn') : [item],
    });
  };

  deleteItem = item => {
    const { checkedStaff } = this.state;
    this.setState({
      checkedStaff: this.multiple
        ? checkedStaff.filter(staff => staff.staff_sn !== item.staff_sn)
        : [],
    });
  };

  render() {
    const { visible, searchType, swicthVisible, value, checkedStaff } = this.state;
    const {
      source: { data, total, page, pagesize },
      fetchLoading,
    } = this.props;
    const realTotal = total || 1;

    return (
      <div id="staff">
        <Modal
          visible={visible}
          onCancel={this.onCancel}
          onOk={this.onOk}
          width="800px"
          bodyStyle={{ padding: 0 }}
          title="选择员工"
          okText="确认"
          cancelText="取消"
          getContainer={() => document.getElementById('staff')}
        >
          <div
            className={style.global_modal}
            onClick={() => this.setState({ swicthVisible: false })}
          >
            <div className={style.modal_content}>
              <div className={style.left_content}>
                <div className={style.content_search} style={{ height: '40px' }}>
                  <div
                    className={style.switch_type}
                    style={{ border: swicthVisible ? '1px solid #1890ff' : '1px solid #eee' }}
                  >
                    <div
                      className={style.type_name}
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({ swicthVisible: true });
                      }}
                    >
                      {searchType.find(item => item.checked).name}
                      <span />
                    </div>
                    {swicthVisible && (
                      <div className={style.type_list}>
                        {searchType.filter(type => !type.checked).map(item => (
                          <div onClick={e => this.switchSearchType(item, e)} key={item.type}>
                            {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={style.search}>
                    <input value={value} onChange={this.inputOnChange} />
                  </div>
                </div>
                <div className={style.search_result_content}>
                  <div style={{ height: '44px' }} />
                  <div style={{ color: '#333333', fontSize: '12px', lineHeight: '20px' }}>
                    <span>搜索结果</span>
                    <span>全选</span>
                    <span>筛选</span>
                  </div>
                  <Spin spinning={fetchLoading || false}>
                    <div className={style.search_result}>
                      {(data || []).map(item => {
                        const checked =
                          checkedStaff.map(staff => staff.staff_sn).indexOf(item.staff_sn) > -1;
                        return (
                          <StaffItem
                            extra={null}
                            detail={item}
                            checked={checked}
                            handleClick={() => this.handleOnChange(item)}
                            key={item.staff_sn}
                          />
                        );
                      })}
                    </div>
                  </Spin>
                  <div className={style.page}>
                    <Pagination
                      size="small"
                      current={page - 0 || 1}
                      total={realTotal}
                      pageSize={pagesize - 0}
                      onChange={this.pageOnChange}
                      showQuickJumper
                    />
                  </div>
                </div>
              </div>
              <div className={style.select_result}>
                <div
                  style={{ height: '40px', lineHeight: '40px', color: '#333', fontSize: '14px' }}
                >
                  已选：
                  {checkedStaff.length}/<span style={{ color: '#999' }}>{total || 0}</span>
                </div>
                <div className={style.checked_list}>
                  {checkedStaff.map(item => (
                    <StaffItem
                      itemStyle={{ marginRight: '0' }}
                      detail={item}
                      checked
                      key={item.staff_sn}
                      extra={<div className={style.delete} onClick={() => this.deleteItem(item)} />}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
StaffModal.defaultProps = {
  extra: <div className={style.delete} />,
  checkedStaff: [],
};
export default StaffModal;
