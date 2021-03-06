import React, { Component } from 'react';
import { Pagination, Modal, Spin, Checkbox, message, TreeSelect } from 'antd';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { connect } from 'dva';
// import TreeSelect from '../../TreeSelect'
import request from '../../../utils/request';

import {
  markTreeData,
  judgeIsNothing,
  getTreeChildren,
  uniqArrayObject,
} from '../../../utils/utils';

import StaffItem from './StaffItem';
import ExtraFilters from './ExtraFilters/index';
import style from './index.less';

const pagesize = 12;
const defSearchType = [
  { name: '部门', type: 2, pl: '请选择部门', key: 'department', text: '', value: '', filter: '' },
  {
    name: '员工',
    type: 1,
    pl: '请输入员工姓名/员工编号',
    checked: 1,
    key: 'staff',
    text: '',
    value: '',
    filter: '',
  },
];
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
    const { visible, fetchDataSource, checkedStaff, multiple } = this.props;
    this.state = {
      visible,
      searchType: defSearchType,
      checkedStaff: checkedStaff || [],
      swicthVisible: false,
      filters: {
        staff: '',
        department: '',
        filter: '',
      },
      extraFilters: {
        status_id: [],
        position_id: [],
        brand_id: [],
      },
      quickUsed: false,
      checkall: {
        all: false,
        curpage: false,
      },
    };
    this.allDataSource = { filters: '', data: [] };
    this.multiple = multiple;
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
        checkedStaff: checkedStaff || [],
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
      this.props.onCancel();
    });
  };

  onOk = () => {
    const { checkedStaff } = this.state;
    this.resetState(() => {
      this.props.onChange(false, this.multiple ? checkedStaff : checkedStaff[0] || '');
    });
  };

  onTreeSelect = value => {
    let depFilters = '';
    const { searchType } = this.state;

    if (value !== 'all') {
      const children = getTreeChildren(value, this.props.department, { parentId: 'parent_id' });
      const childIds = children.map(item => item.id);
      depFilters = `department.id=[${childIds.concat(value).join(',')}]`;
    }
    const filters = {
      ...this.resetObject(this.state.filters),
      department: depFilters,
    };
    const newTypes = this.makeNewTypes(searchType, 'department', {
      filter: depFilters,
      value,
      text:
        value !== 'all'
          ? this.props.department.find(dep => `${dep.id}` === `${value}`).full_name
          : '',
    });
    this.setState(
      {
        filters,
        searchType: newTypes,
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize: 12,
          filters: this.mapFilters(this.makeAllFilters()),
        });
      }
    );
  };

  checkCurAll = e => {
    const value = e.target.checked;
    const {
      source: { data },
    } = this.props;
    const { checkedStaff } = this.state;
    const staffSns = data.map(item => item.staff_sn);
    let newCheckedStaffs;
    if (!value) {
      newCheckedStaffs = (checkedStaff || []).filter(
        item => staffSns.indexOf(item.staff_sn) === -1
      );
    } else {
      newCheckedStaffs = data.concat(checkedStaff);
      this.saveSearchHistory();
    }
    this.setState({
      checkall: { ...this.state.checkall, curpage: value },
      checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
    });
  };

  checkAll = value => {
    const {
      fetchUrl,
      source: { total },
      range: { max },
    } = this.props;
    const { checkedStaff } = this.state;
    const staffSns = this.allDataSource.data.map(item => item.staff_sn);
    let newCheckedStaffs = '';

    if (!value) {
      // 取消全选
      newCheckedStaffs = (checkedStaff || []).filter(
        item => staffSns.indexOf(item.staff_sn) === -1
      );
      this.setState({
        checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
      });
    } else {
      if (total - (max || 50) > 0) {
        message.warning(`超出最大限制，最多选择${max || 50}人!`, 2);
        return;
      }
      const filters = this.mapFilters(this.makeAllFilters());
      const sn = checkedStaff.map(item => item.staff_sn);
      const extra = this.allDataSource.data.length
        ? this.allDataSource.data.find(item => sn.indexOf(item.staff_sn) === -1)
        : [];
      if (!extra) {
        message.warning('该条件下已经全部选择', 2);
        return;
      }
      request(fetchUrl, {
        method: 'GET',
        body: { filters: this.mapFilters(this.makeAllFilters()) },
      }).then(res => {
        this.allDataSource = { filters, data: res };
        newCheckedStaffs = res.concat(checkedStaff);
        this.saveSearchHistory();
        this.setState({
          checkedStaff: [...newCheckedStaffs].unique('staff_sn'),
        });
      });
    }
  };

  makeAllFilters = () => {
    const { extraFilters } = this.state;
    const extraFiltersStr = this.makeExtraFilter(extraFilters);
    const newFilters = { ...this.state.filters, ...extraFiltersStr };
    return newFilters;
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
        searchType: [...defSearchType],
        swicthVisible: false,
        filters: {},
        quickUsed: false,
      },
      () => {
        if (cb) {
          cb();
        }
      }
    );
  };

  makeNewTypes = (searchType, key, params) => {
    const newTypes = searchType.map(item => {
      let obj = { ...defSearchType.find(it => it.key === item.key) };
      obj.checked = item.checked;
      if (item.key === key) {
        obj = { ...obj, ...params };
      }
      return obj;
    });
    return newTypes;
  };

  inputOnChange = (e, key = 'staff') => {
    const { value } = e.target;
    const { searchType } = this.state;
    const staffFilter = value ? `realname~${value}|staff_sn~${value}` : '';
    const filters = this.resetObject(this.state.filters);
    const newTypes = this.makeNewTypes(searchType, key, {
      filter: staffFilter,
      value,
      text: value,
    });
    this.setState(
      {
        filters: { ...filters, staff: staffFilter },
        searchType: [...newTypes],
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize: 12,
          filters: this.mapFilters(this.makeAllFilters()),
        });
      }
    );
  };

  resetObject = obj => {
    const temp = {};
    Object.keys(obj).forEach(key => {
      temp[key] = '';
    });
    return temp;
  };

  switchSearchType = (item, e) => {
    e.stopPropagation();
    const { searchType } = this.state;
    const newSearchType = searchType.map(t => {
      const newItem = { ...t, checked: 0 };
      if (t.type === item.type) {
        newItem.checked = 1;
      }
      return newItem;
    });
    this.setState({
      searchType: [...newSearchType],
      swicthVisible: false,
    });
  };

  pageOnChange = page => {
    this.fetchDataSource({
      page,
      pagesize: 12,
      filters: this.mapFilters(this.makeAllFilters()),
    });
  };

  handleOnChange = item => {
    const { checkedStaff } = this.state;
    const isChecked = (checkedStaff || []).find(staff => staff.staff_sn === item.staff_sn);
    let newCheckedStaff = '';
    if (this.multiple) {
      if (isChecked) {
        newCheckedStaff = checkedStaff.filter(staff => staff.staff_sn !== item.staff_sn);
      } else {
        newCheckedStaff = checkedStaff.concat(item);
        this.saveSearchHistory();
      }
    } else if (isChecked) {
      newCheckedStaff = [];
    } else {
      newCheckedStaff = [item];
      this.saveSearchHistory();
    }
    this.setState({
      checkedStaff: newCheckedStaff,
    });
  };

  saveSearchHistory = () => {
    const { searchType } = this.state;
    const checkedType = searchType.find(item => item.filter !== '');
    if (checkedType) {
      const his = localStorage.getItem('pc_wokrflow_StaffSearch') || '[]';
      let values = JSON.parse(his === 'undefined' ? '[]' : his);
      const obj = {
        text: checkedType.text,
        filter: checkedType.filter,
        key: checkedType.key,
        value: checkedType.value,
      };
      values = [obj, ...values];
      const uniqValues = uniqArrayObject(values, 'filter').slice(0, 10);
      localStorage.setItem('pc_wokrflow_StaffSearch', JSON.stringify(uniqValues));
    }
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

  quickFetch = dep => {
    const {
      currentUser: { department },
    } = this.props;
    const { searchType } = this.state;
    const children = getTreeChildren(department.parent_id || department.id, this.props.department, {
      parentId: 'parent_id',
    });
    const childIds = children.map(item => item.id);
    const depFilters = `department.id=[${childIds
      .concat(department.parent_id || department.id)
      .join(',')}]`;
    const filters = { ...this.state.filters, department: depFilters };
    const newTypes = searchType.map(type => {
      let obj = { ...type, checked: 0 };
      if (type.key === 'department') {
        obj = {
          ...obj,
          ...{ value: dep.parent_id || dep.id, text: dep.full_name, filter: depFilters },
          checked: 1,
        };
      }
      return obj;
    });
    this.setState({
      filters,
      searchType: newTypes,
    });
    this.fetchFiltersDataSource({ page: 1, pagesize, filters: this.mapFilters(filters) });
  };

  filtersChange = value => {
    this.setState(
      {
        extraFilters: value,
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize: 12,
          filters: this.mapFilters(this.makeAllFilters()),
        });
      }
    );
  };

  makeExtraFilter = filter => {
    const extraFiltersStr = {};
    Object.keys(filter).forEach(item => {
      extraFiltersStr[item] = filter[item].length ? `${item}=[${filter[item]}]` : '';
    });
    return extraFiltersStr;
  };

  historySearch = item => {
    const { searchType } = this.state;
    const newTypes = searchType.map(type => {
      let obj = { ...type, checked: 0 };
      if (type.key === item.key) {
        obj = { ...obj, ...item, checked: 1 };
      }
      return obj;
    });
    const filters = { ...this.state.filters, [item.key]: item.filter };

    this.setState(
      {
        searchType: newTypes,
        filters,
      },
      () => {
        this.fetchDataSource({
          page: 1,
          pagesize: 12,
          filters: this.mapFilters(filters),
        });
      }
    );
  };

  renderPageHeader = () => {
    const { searchType, swicthVisible } = this.state;
    const { department } = this.props;
    const curTab = searchType.find(item => item.checked);
    const newTreeData = markTreeData(
      department,
      { value: 'id', label: 'name', parentId: 'parent_id' },
      0,
      true
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
            {' '}
            {curTab.name} <span />
          </div>{' '}
          {swicthVisible && (
            <div className={style.type_list}>
              {' '}
              {searchType.filter(type => !type.checked).map(item => (
                <div onClick={e => this.switchSearchType(item, e)} key={item.type}>
                  {' '}
                  {item.name}{' '}
                </div>
              ))}
            </div>
          )}
        </div>{' '}
        <div className={style.search}>
          {' '}
          {curTab.type === 1 ? (
            <input value={curTab.text} onChange={this.inputOnChange} placeholder={curTab.pl} />
          ) : (
            <TreeSelect
              dropdownClassName={style.dropdown}
              treeDefaultExpandedKeys={['all']}
              showSearch
              value={curTab.value}
              treeNodeLabelProp="full_name"
              treeData={[{ value: 'all', title: '全部', full_name: '全部', children: newTreeData }]}
              onSelect={this.onTreeSelect}
              filterTreeNode={(inputValue, treeNode) =>
                treeNode.props.title.indexOf(inputValue) !== -1
              }
            />
          )}
        </div>
      </div>
    );
  };

  renderSearchHistory = () => {
    const his = localStorage.getItem('pc_wokrflow_StaffSearch') || '[]';
    const searchValues = JSON.parse(his === 'undefined' ? '[]' : his);
    return (
      <div className={style.history}>
        <div className={style.his_title}>历史记录：</div>
        {searchValues.map(item => (
          <div
            key={`${item.key}-${item.filter}`}
            className={style.his_item}
            onClick={() => this.historySearch(item)}
          >
            {item.text}
          </div>
        ))}
      </div>
    );
  };

  renderCheckResult = () => {
    const { checkedStaff } = this.state;
    const { range } = this.props;
    return (
      <div className={style.select_result}>
        <div
          style={{
            height: '40px',
            lineHeight: '40px',
            color: '#333',
            fontSize: '14px',
            paddingRight: '24px',
          }}
        >
          <div className={style.checked_count}>
            已选：{' '}
            <span
              style={{
                color: checkedStaff.length - (range.max || 50) <= 0 ? 'rgb(51, 51, 51)' : '#d9333f',
              }}
            >
              {checkedStaff.length}{' '}
            </span>
            /<span style={{ color: '#999' }}> {this.multiple ? range.max || '50' : '1'} </span>
          </div>{' '}
          <div
            className={style.checked_clear}
            onClick={() => {
              this.setState({
                checkedStaff: [],
              });
            }}
          >
            清空
          </div>
        </div>{' '}
        <div className={style.checked_list}>
          {' '}
          {(checkedStaff || []).map(item => (
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
      <div className={style.history}>
        <div className={style.his_title}>快捷搜索：</div>
        <div
          className={style.his_item}
          onClick={() => this.quickFetch(this.props.currentUser.department)}
        >
          {this.props.currentUser && this.props.currentUser.department
            ? (() => {
                const names = this.props.currentUser.department.full_name.split('-');
                if (names.length > 1) {
                  return names[names.length - 2];
                }
                return names[0];
              })()
            : ''}
        </div>
      </div>
      {/* <div className={style.search_result} style={{ height: 'auto', cursor: 'pointer' }}>
        <div className={style.quick_item} onClick={()=>this.quickFetch(this.props.currentUser.department)}>
          {' '}
          {this.props.currentUser && this.props.currentUser.department
            ? this.props.currentUser.department.full_name
            : ''}
        </div>{' '}
      </div> */}
    </div>
  );

  renderStaffList = () => {
    const { checkedStaff, extraFilters, searchType } = this.state;
    const {
      source: { data, total, page },
      fetchLoading,
      multiple,
      status,
      brands,
      positions,
    } = this.props;
    const staffSns = (checkedStaff || []).map(item => item.staff_sn);
    const extra = data.find(item => staffSns.indexOf(item.staff_sn) === -1);
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
    const btnStyle = { color: '#333', background: '#fff', border: '1px solid #ccc' };
    return (
      <div style={{ marginTop: '15px' }}>
        <div style={{ color: '#333333', fontSize: '12px', lineHeight: '20px' }}>
          <span> 搜索结果</span>{' '}
          <ExtraFilters
            filterDataSource={treeData}
            onChange={this.filtersChange}
            filters={extraFilters}
          >
            <span className={cls} id="filter">
              筛选
            </span>
          </ExtraFilters>{' '}
          {multiple ? (
            <React.Fragment>
              <span className={style.checkall}>
                <Checkbox onClick={this.checkCurAll} checked={!extra}>
                  选择当前页
                </Checkbox>
              </span>{' '}
              <span
                className={style.checkall}
                style={btnStyle}
                onClick={() => this.checkAll(false)}
              >
                清空全选
              </span>{' '}
              <span className={style.checkall} style={btnStyle} onClick={() => this.checkAll(true)}>
                全选
              </span>
            </React.Fragment>
          ) : null}
        </div>{' '}
        <Spin spinning={fetchLoading || false}>
          {' '}
          <div className={style.search_result}>
            {' '}
            {(data || []).map(item => {
              const checked =
                (checkedStaff || []).map(staff => staff.staff_sn).indexOf(item.staff_sn) > -1;
              return (
                <StaffItem
                  extra={null}
                  detail={item}
                  keywords={
                    searchType.find(it => it.checked === 1)
                      ? searchType.find(it => it.checked === 1).text
                      : ''
                  }
                  checked={checked}
                  handleClick={() => this.handleOnChange(item)}
                  key={item.staff_sn}
                />
              );
            })}
          </div>{' '}
        </Spin>{' '}
        <div className={style.page}>
          <Pagination
            size="small"
            current={page - 0 || 1}
            showTotal={t => `总共 ${t} 条`}
            total={realTotal}
            pageSize={pagesize - 0}
            onChange={this.pageOnChange}
          />
        </div>
      </div>
    );
  };

  render() {
    const { visible, quickUsed, checkedStaff } = this.state;
    const {
      range: { max },
    } = this.props;
    return (
      <div id="staff" onClick={e => e.stopPropagation()}>
        <Modal
          visible={visible}
          onCancel={this.onCancel}
          onOk={this.onOk}
          width="800px"
          bodyStyle={{ padding: 0 }}
          title="选择员工"
          okText="确认"
          okButtonProps={{ disabled: checkedStaff.length - (max || 50) > 0 }}
          cancelText="取消"
          getContainer={() => document.getElementById('staff')}
        >
          <div
            className={style.global_modal}
            onClick={() => this.setState({ swicthVisible: false })}
          >
            <div className={style.modal_content}>
              <div className={style.left_content}>
                {' '}
                {this.renderPageHeader()} {quickUsed ? null : this.renderSearchHistory()}
                <div className={style.search_result_content}>
                  {quickUsed ? this.renderStaffList() : this.renderQuickSearch()}{' '}
                </div>
              </div>{' '}
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
  range: { max: 50, min: 1 },
};
export default StaffModal;
