import React, { Component } from 'react';
import { Pagination, Modal, Spin, Checkbox, message, TreeSelect } from 'antd';
import { debounce } from 'lodash';
import classNames from 'classnames';
import { connect } from 'dva';
// import TreeSelect from '../../TreeSelect'
import request from '../../../utils/request';

import { markTreeData, judgeIsNothing, getTreeChildren } from '../../../utils/utils';

import ShopItem from './ShopItem';
import ExtraFilters from './ExtraFilters/index';
import style from './index.less';

const pagesize = 8;
const defSearchType = [
  { name: '名称', type: 1, checked: 1, pl: '请输入店铺名称/店铺代码' },
  { name: '部门', type: 2, pl: '请选择部门' },
  { name: '员工', type: 3, pl: '请输入员工姓名/员工编号' },
];
@connect(({ staff, loading, manager }) => ({
  source: staff.shopSource,
  department: staff.department,
  brands: staff.brands,
  status: staff.shopStatus,
  positions: staff.positions,
  fetchLoading: loading.effects['staff/fetchShops'],
  currentUser: manager.current,
}))
class ShopModal extends Component {
  constructor(props) {
    super(props);
    const { visible, fetchDataSource, checkedShop, multiple, currentUser } = this.props;
    this.state = {
      visible,
      searchType: defSearchType,
      checkedShop: checkedShop || [],
      swicthVisible: false,
      searchValue: '',
      filters: {
        shop: '',
        staff: '',
        department: '',
        filter: '',
      },
      extraFilters: {
        status_id: [],
        position_id: [],
        brand_id: [],
      },
    };
    this.allDataSource = { filters: '', data: [] };
    this.multiple = multiple;
    this.currentUser = currentUser;
    this.fetchFiltersDataSource = debounce(params => {
      fetchDataSource(params);
    }, 500);
    this.fetchDataSource = params => {
      fetchDataSource(params);
    };
  }

  componentWillMount() {
    this.fetchDepatment();
    // this.fetchBrands();
    // this.fetchPositions();
  }

  componentWillReceiveProps(props) {
    const { visible, checkedShop } = props;
    if (
      visible !== this.props.visible ||
      JSON.stringify(checkedShop) !== JSON.stringify(this.props.checkedShop)
    ) {
      this.setState({
        visible,
        checkedShop: checkedShop || [],
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
        this.multiple ? this.props.checkedShop : this.props.checkedShop[0] || ''
      );
    });
  };

  onOk = () => {
    const { checkedShop } = this.state;
    this.resetState(() => {
      this.props.onChange(false, this.multiple ? checkedShop : checkedShop[0] || '');
    });
  };

  onTreeSelect = value => {
    let depFilters = '';
    if (value !== 'all') {
      const children = getTreeChildren(value, this.props.department, { parentId: 'parent_id' });
      const childIds = children.map(item => item.id);
      depFilters = `department.id=[${childIds.concat(value).join(',')}]`;
    }
    const filters = {
      ...this.resetObject(this.state.filters),
      department: depFilters,
    };
    this.setState(
      {
        searchValue: '',
        filters,
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize,
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

  checkCurAll = e => {
    const value = e.target.checked;
    const {
      source: { data },
    } = this.props;
    const { checkedShop } = this.state;
    const staffSns = data.map(item => item.shop_sn);
    let newCheckedStaffs;
    if (!value) {
      newCheckedStaffs = checkedShop.filter(item => staffSns.indexOf(item.shop_sn) === -1);
    } else {
      newCheckedStaffs = data.concat(checkedShop);
    }
    this.setState({
      checkedShop: [...newCheckedStaffs].unique('shop_sn'),
    });
  };

  checkAll = value => {
    const {
      fetchUrl,
      source: { total },
    } = this.props;
    const { checkedShop } = this.state;
    const staffSns = this.allDataSource.data.map(item => item.shop_sn);
    let newCheckedStaffs = '';

    if (!value) {
      newCheckedStaffs = (checkedShop || []).filter(item => staffSns.indexOf(item.shop_sn) === -1);
      this.setState({
        checkedShop: [...newCheckedStaffs].unique('shop_sn'),
      });
    } else {
      if (total > 60) {
        message.warning('超出最大限制，最多选择60人!', 2);
        return;
      }
      const filters = this.mapFilters(this.makeAllFilters());
      const sn = (checkedShop || []).map(item => item.shop_sn);
      const extra = this.allDataSource.data.length
        ? this.allDataSource.data.find(item => sn.indexOf(item.shop_sn) === -1)
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
        newCheckedStaffs = res.concat(checkedShop);
        this.setState({
          checkedShop: [...newCheckedStaffs].unique('shop_sn'),
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
        searchType: defSearchType,
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

  inputOnChange = (e, type) => {
    const { value } = e.target;
    const filter = this.resetObject(this.state.filters);
    if (value) {
      if (type === 1) {
        filter.shop = `name~${value}|shop_sn~${value}`;
      } else {
        filter.staff = `staff.realname~${value}|staff.staff_sn~${value}`;
      }
    }
    const filters = { ...filter };
    this.setState(
      {
        searchValue: value,
        filters,
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize,
          filters: this.mapFilters(this.makeAllFilters()),
        });
      }
    );
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
    this.fetchDataSource({
      page,
      pagesize,
      filters: this.mapFilters(this.makeAllFilters()),
    });
  };

  handleOnChange = item => {
    const { checkedShop } = this.state;
    const isChecked = checkedShop.find(shop => shop.shop_sn === item.shop_sn);
    let newCheckedShop = '';
    if (this.multiple) {
      if (isChecked) {
        newCheckedShop = checkedShop.filter(shop => shop.shop_sn !== item.shop_sn);
      } else {
        newCheckedShop = checkedShop.concat(item);
      }
    } else if (isChecked) {
      newCheckedShop = [];
    } else {
      newCheckedShop = [item];
    }
    this.setState({
      checkedShop: newCheckedShop,
    });
  };

  deleteItem = item => {
    const { checkedShop } = this.state;
    this.setState({
      checkedShop: this.multiple ? checkedShop.filter(staff => staff.shop_sn !== item.shop_sn) : [],
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
      },
      () => {
        this.fetchFiltersDataSource({
          page: 1,
          pagesize,
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

  renderPageHeader = () => {
    const { searchType, swicthVisible, searchValue } = this.state;
    const { department } = this.props;
    const curTab = searchType.find(item => item.checked);
    const newTreeData = markTreeData(
      department,
      { value: 'id', title: 'name', parentId: 'parent_id' },
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
            {curTab.name} <span />
          </div>{' '}
          {swicthVisible && (
            <div className={style.type_list}>
              {' '}
              {searchType.filter(type => !type.checked).map(item => (
                <div onClick={e => this.switchSearchType(item, e)} key={item.type}>
                  {' '}
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>{' '}
        <div className={style.search}>
          {' '}
          {curTab.type === 1 || curTab.type === 3 ? (
            <input
              value={searchValue}
              placeholder={curTab.pl}
              onChange={e => this.inputOnChange(e, curTab.type)}
            />
          ) : (
            <TreeSelect
              dropdownClassName={style.dropdown}
              treeDefaultExpandedKeys={['all']}
              showSearch
              treeData={[{ value: 'all', title: '全部', children: newTreeData }]}
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

  renderCheckResult = () => {
    const { checkedShop } = this.state;
    const {
      range: { max },
    } = this.props;
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
            已选：
            <span
              style={{
                color: checkedShop.length - (max || 50) <= 0 ? 'rgb(51, 51, 51)' : '#d9333f',
              }}
            >
              {checkedShop.length}{' '}
            </span>
            / <span style={{ color: '#999' }}> {this.multiple ? max || '50' : '1'}</span>
          </div>{' '}
          <div
            className={style.checked_clear}
            onClick={() => {
              this.setState({
                checkedShop: [],
              });
            }}
          >
            清空
          </div>
        </div>{' '}
        <div className={style.checked_list}>
          {' '}
          {checkedShop.map(item => (
            <ShopItem
              itemStyle={{ marginRight: '0' }}
              detail={item}
              checked
              key={item.shop_sn}
              extra={<div className={style.delete} onClick={() => this.deleteItem(item)} />}
            />
          ))}{' '}
        </div>
      </div>
    );
  };

  renderStaffList = () => {
    const { checkedShop, extraFilters, searchValue, searchType } = this.state;
    const {
      source: { data, total, page },
      fetchLoading,
      multiple,
      status,
    } = this.props;
    const curTab = searchType.find(item => item.checked);
    const shopSns = checkedShop.map(item => item.shop_sn);
    const extra = data.find(item => shopSns.indexOf(item.shop_sn) === -1);
    const realTotal = total || 1;
    const statusOpt = status.map(item => {
      const obj = {
        ...item,
        title: item.text,
        key: `status_id-${item.value}`,
      };
      return obj;
    });
    const treeData = [{ title: '状态', key: 'status_id', children: statusOpt }];
    const cls = classNames(style.filter, {
      [style.active]: this.mapFilters(extraFilters),
    });
    const btnStyle = { color: '#333', background: '#fff', border: '1px solid #ccc' };
    return (
      <div>
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
          <div className={style.search_result}>
            {' '}
            {(data || []).map(item => {
              const checked =
                (checkedShop || []).map(staff => staff.shop_sn).indexOf(item.shop_sn) > -1;
              return (
                <ShopItem
                  extra={null}
                  detail={item}
                  checked={checked}
                  keywords={{ type: curTab.type, value: searchValue }}
                  handleClick={() => this.handleOnChange(item)}
                  key={item.shop_sn}
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
    const { visible, checkedShop } = this.state;
    const {
      range: { max },
    } = this.props;
    return (
      <div id="shop">
        <Modal
          visible={visible}
          onCancel={this.onCancel}
          onOk={this.onOk}
          width="800px"
          bodyStyle={{ padding: 0 }}
          title="选择店铺"
          okText="确认"
          okButtonProps={{ disabled: checkedShop.length - (max || 50) > 0 }}
          cancelText="取消"
          getContainer={() => document.getElementById('shop')}
        >
          <div
            className={style.global_modal}
            onClick={() => this.setState({ swicthVisible: false })}
          >
            <div className={style.modal_content}>
              <div className={style.left_content}>
                {' '}
                {this.renderPageHeader()}{' '}
                <div className={style.search_result_content}>
                  <div style={{ height: '44px' }} /> {this.renderStaffList()}
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
ShopModal.defaultProps = {
  extra: <div className={style.delete} />,
  checkedShop: [],
  fetchUrl: '/api/oa/staff',
  range: { max: 50, min: 1 },
};
export default ShopModal;
