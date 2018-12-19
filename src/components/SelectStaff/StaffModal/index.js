import React, { Component } from 'react';
import { Pagination, Modal, Spin, TreeSelect, Checkbox } from 'antd';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { connect } from 'dva';
import request from '../../../utils/request';

import { markTreeData, judgeIsNothing } from '../../../utils/utils';

import StaffItem from './StaffItem';
import ExtraFilters from './ExtraFilters/index';
import style from './index.less';

@connect(({ staff, loading, manager }) => ({
  source: staff.source,
  department: staff.department,
  brands: staff.brands,
  status: staff.status,
  positions: staff.positions,
  fetchLoading: loading.effects['staff/fetchStaffs'],
  currentUser: manager.current,
}))
class StaffModal extends Component {
  constructor(props) {
    super(props);
    const { visible, fetchDataSource, checkedStaff, multiple, currentUser } = this.props;
    this.state = {
      visible,
      searchType: [{ name: '员工', type: 1, checked: 1 }, { name: '部门', type: 2 }],
      checkedStaff,
      swicthVisible: false,
      searchValue: '',
      filters: {
        staff: '',
        department: '',
        filter: '',
      },
      extraFilters: {
        status_id: [],
        position_is: [],
        brand_id: [],
      },
      quickUsed: false,
      checkall: {
        all: false,
        curpage: false,
      },
    };
    this.allDataSource = [];
    this.multiple = multiple;
    this.currentUser = currentUser;
    this.fetchFiltersDataSource = debounce(params => {
      if (!this.state.quickUsed) {
        this.setState({
          quickUsed: true,
        });
      }
      fetchDataSource(params);
    }, 500);
    this.fetchDataSource = params => {
      if (!this.state.quickUsed) {
        this.setState({
          quickUsed: true,
        });
      }
      fetchDataSource(params);
    };
  }

  componentWillMount() {
    this.fetchDepatment();
    this.fetchBrands();
    this.fetchPositions();
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

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(this.state) !== JSON.stringify(nextState)
    );
  }

  onCancel = () => {
    this.resetState(() => {
      this.props.onChange(
        false,
        this.multiple ? this.props.checkedStaff : this.props.checkedStaff[0]
      );
    });
  };

  onOk = () => {
    const { checkedStaff } = this.state;
    this.resetState(() => {
      this.props.onChange(false, this.multiple ? checkedStaff : checkedStaff[0]);
    });
  };

  onTreeSelect = (value, a, extra) => {
    const {
      node: {
        props: { title },
      },
    } = extra;
    const filters = { department: `department.full_name~${title}`, staff: '', filter: '' };
    this.setState({
      filters,
    });
    this.fetchDataSource({
      page: 1,
      pagesize: 12,
      filters: this.mapFilters(filters),
    });
  };

  checkCurAll = e => {
    const value = e.target.checked;
    const {
      source: { data },
    } = this.props;
    const { checkedStaff } = this.state;
    // const { checkall: { curpage } } = this.state;
    const staffSns = data.map(item => item.staff_sn);
    let newCheckedStaffs;
    if (!value) {
      newCheckedStaffs = checkedStaff.filter(item => staffSns.indexOf(item.staff_sn) === -1);
    } else {
      newCheckedStaffs = data.concat(checkedStaff);
    }
    this.setState({
      checkall: { ...this.state.checkall, curpage: value },
      checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
    });
  };

  checkAll = value => {
    const { fetchUrl } = this.props;
    const { checkedStaff } = this.state;
    const staffSns = this.allDataSource.map(item => item.staff_sn);
    let newCheckedStaffs = '';
    if (!value) {
      newCheckedStaffs = checkedStaff.filter(item => staffSns.indexOf(item.staff_sn) === -1);
      this.setState({
        checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
      });
    } else {
      request(fetchUrl, {
        method: 'GET',
        body: { filters: this.mapFilters(this.state.filters) },
      }).then(res => {
        this.allDataSource = res;
        newCheckedStaffs = res.concat(checkedStaff);
        this.setState({
          checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
        });
      });
    }
  };

  fetchDepatment = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchDepartment',
    });
  };

  fetchBrands = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchBrands',
    });
  };

  fetchPositions = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'staff/fetchPositions',
    });
  };

  resetState = cb => {
    this.setState(
      {
        visible: false,
        searchType: [{ name: '员工', type: 1, checked: 1 }, { name: '部门', type: 2 }],
        swicthVisible: false,
        searchValue: '',
        quickUsed: false,
      },
      () => {
        if (cb) {
          cb();
        }
      }
    );
  };

  inputOnChange = e => {
    const { value } = e.target;
    const staffFilter = value ? `department.name~${value}|realname~${value}|staff_sn~${value}` : '';
    const filters = { ...this.state.filters, staff: staffFilter, department: '' };
    this.setState({
      searchValue: value,
      filters,
    });
    this.fetchFiltersDataSource({
      page: 1,
      pagesize: 12,
      filters: this.mapFilters(filters),
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
    const { filters } = this.state;
    this.setState({
      checkall: { all: false, curpage: false },
    });
    this.fetchDataSource({
      page,
      pagesize: 12,
      filters: this.mapFilters(filters),
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

  mapFilters = filters =>
    Object.keys(filters)
      .map(key => filters[key])
      .filter(item => judgeIsNothing(item))
      .join(';');

  quickFetch = () => {
    const { department } = this.currentUser;
    const depFilters = `department.id=${department.parent_id || department.id}`;
    const filters = { ...this.state.filters, department: depFilters };
    this.setState({
      filters,
    });
    this.fetchFiltersDataSource({ page: 1, filters: this.mapFilters(filters) });
  };

  filtersChange = value => {
    this.setState(
      {
        extraFilters: value,
        filters: {
          ...this.filters,
          department: '',
          staff: '',
        },
      },
      () => {
        const extraFiltersStr = {};
        Object.keys(value).forEach(item => {
          extraFiltersStr[item] = value[item].length ? `${item}=[${value[item]}]` : '';
        });
        const filters = { ...this.state.filters, ...extraFiltersStr };
        this.fetchFiltersDataSource({ page: 1, pagesize: 12, filters: this.mapFilters(filters) });
      }
    );
  };

  renderPageHeader = () => {
    const { searchType, swicthVisible, searchValue } = this.state;
    const { department } = this.props;
    const curTab = searchType.find(item => item.checked);
    const newTreeData = markTreeData(
      department,
      { value: 'id', label: 'name', parentId: 'parent_id' },
      0
    );
    return (
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
            {curTab.name}
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
          {curTab.type === 1 ? (
            <input value={searchValue} onChange={this.inputOnChange} />
          ) : (
            <TreeSelect
              dropdownClassName={style.dropdown}
              maxTagCount={10}
              showSearch
              treeData={newTreeData}
              // onSearch={this.onTreeSearch}
              onSelect={this.onTreeSelect}
            />
          )}
        </div>
      </div>
    );
  };

  renderCheckResult = () => {
    const { checkedStaff } = this.state;

    return (
      <div className={style.select_result}>
        <div style={{ height: '40px', lineHeight: '40px', color: '#333', fontSize: '14px' }}>
          已选：
          {checkedStaff.length}/<span style={{ color: '#999' }}>{this.multiple ? '50' : '1'}</span>
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
    );
  };

  renderQuickSearch = () => (
    <div>
      <div style={{ color: '#333333', fontSize: '12px', lineHeight: '20px' }}>
        <span>快捷搜索</span>
      </div>
      <div className={style.search_result} style={{ height: 'auto' }}>
        <div className={style.quick_item} onClick={this.quickFetch}>
          {this.currentUser ? this.currentUser.department.full_name : ''}
        </div>
      </div>
    </div>
  );

  renderStaffList = () => {
    const { checkedStaff, extraFilters } = this.state;

    const {
      source: { data, total, page, pagesize },
      fetchLoading,
      multiple,
      status,
      brands,
      positions,
    } = this.props;
    const staffSns = checkedStaff.map(item => item.staff_sn);
    const extra = data.find(item => staffSns.indexOf(item.staff_sn) === 0);
    console.log(staffSns, data);
    const realTotal = total || 1;
    const brandsOpt = brands.map(item => {
      const obj = {
        ...item,
        title: item.name,
        key: `brand_id-${item.id}`,
      };
      return obj;
    });
    const statusOpt = status.map(item => {
      const obj = {
        ...item,
        title: item.text,
        key: `status_id-${item.value}`,
      };
      return obj;
    });
    const positionsOpt = positions.map(item => {
      const obj = {
        ...item,
        title: item.name,
        key: `position_id-${item.id}`,
      };
      return obj;
    });
    const treeData = [
      { title: '品牌', key: 'brand_id', children: brandsOpt },
      { title: '职位', key: 'position_id', children: positionsOpt },
      { title: '状态', key: 'status_id', children: statusOpt },
    ];
    const cls = classNames(style.filter, {
      [style.active]: this.mapFilters(extraFilters),
    });
    // const ableCheckAll = (total + checkedStaff.length) > 50;
    const ableCheckAll = total < 61;
    const btnStyle = ableCheckAll
      ? { color: '#333', background: '#fff', border: '1px solid #ccc' }
      : { color: '#fff', background: '#ccc', border: '1px solid #ccc' };
    return (
      <div>
        <div style={{ color: '#333333', fontSize: '12px', lineHeight: '20px' }}>
          <span>搜索结果</span>
          <ExtraFilters
            filterDataSource={treeData}
            onChange={this.filtersChange}
            filters={extraFilters}
          >
            <span className={cls}>筛选</span>
          </ExtraFilters>
          {multiple ? (
            <React.Fragment>
              <span className={style.checkall}>
                <Checkbox onClick={this.checkCurAll} checked={!extra}>
                  选择当前页
                </Checkbox>
              </span>
              <span
                className={style.checkall}
                // style={btnStyle}
                onClick={() => this.checkAll(false)}
              >
                清空全选
              </span>
              <span
                className={style.checkall}
                // style={btnStyle}
                onClick={ableCheckAll ? () => this.checkAll(true) : () => {}}
              >
                全选
              </span>
            </React.Fragment>
          ) : null}
        </div>
        <Spin spinning={fetchLoading || false}>
          <div className={style.search_result}>
            {(data || []).map(item => {
              const checked = checkedStaff.map(staff => staff.staff_sn).indexOf(item.staff_sn) > -1;
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
    );
  };

  render() {
    const { visible, quickUsed } = this.state;
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
                {this.renderPageHeader()}
                <div className={style.search_result_content}>
                  <div style={{ height: '44px' }} />
                  {quickUsed ? this.renderStaffList() : this.renderQuickSearch()}
                </div>
              </div>
              {this.renderCheckResult()}
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
  fetchUrl: '/api/oa/staff',
};
export default StaffModal;
