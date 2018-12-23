import React, { PureComponent } from 'react';
import { Button, Dropdown, Menu, Tooltip, Popover, Tag } from 'antd';
import { keys } from 'lodash';
import styles from './index.less';
import MoreSearch from './MoreSearch';

const ButtonGroup = Button.Group;
class Operator extends PureComponent {
  state = {
    hovered: false,
  };

  handleHoverChange = visible => {
    this.setState({
      hovered: !!visible,
    });
  };

  makeMultiOperator = () => {
    const { multiOperator, selectedRowsReal } = this.props;
    return (
      <Menu
        onClick={({ key }) => {
          const [_thisClick] = multiOperator.filter((_, index) => index.toString() === key);
          _thisClick.action(selectedRowsReal);
        }}
      >
        {multiOperator.map((item, index) => {
          const key = `${index}`;
          return <Menu.Item key={key}>{item.text}</Menu.Item>;
        })}
      </Menu>
    );
  };

  renderFiltersTag = () => {
    const { filtersText, resetFilter } = this.props;
    return (
      <div style={{ width: 300, maxHeight: 230, overflowY: 'scroll' }}>
        {Object.keys(filtersText).map(key => {
          const value = filtersText[key];
          const tag = `${value.title}：${value.text}`;
          const onlyk = key;
          const isLongTag = tag.length > 10;
          const tagElem = (
            <Tag key={onlyk} closable afterClose={() => resetFilter(key)}>
              {isLongTag ? `${tag.slice(0, 10)}...` : tag}
            </Tag>
          );
          return isLongTag ? (
            <Tooltip title={tag} key={key}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          );
        })}
      </div>
    );
  };

  render() {
    const {
      sync,
      filters,
      onChange,
      moreSearch,
      resetFilter,
      filtersText,
      selectedRowsReal,
      multiOperator,
      extraOperator,
      extraOperatorRight,
      fetchTableDataSource,
      filterDropdownVisible,
    } = this.props;
    const hasFilter = keys(filtersText).length > 0;
    const style = extraOperator.length ? { marginRight: 20 } : {};
    return (
      <div style={{ display: 'flex' }}>
        <div
          className={styles.filterTableOperator}
          style={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          {sync && (
            <Tooltip title="数据同步">
              <Button icon="sync" onClick={fetchTableDataSource} />
            </Tooltip>
          )}
          {extraOperator || null}
          {moreSearch && (
            <MoreSearch
              filters={filters}
              onChange={onChange}
              moreSearch={moreSearch}
              filtersText={filtersText}
              filterDropdownVisible={filterDropdownVisible}
            />
          )}
          <span style={style} />
          {hasFilter && (
            <ButtonGroup>
              <Button onClick={() => resetFilter()}>清空筛选</Button>
              <Popover
                trigger="hover"
                placement="bottomLeft"
                visible={this.state.hovered}
                content={this.renderFiltersTag()}
                onVisibleChange={this.handleHoverChange}
                getPopupContainer={triggerNode => triggerNode}
              >
                <Button icon="down" />
              </Popover>
            </ButtonGroup>
          )}
          {selectedRowsReal.length > 0 &&
            multiOperator && (
              <React.Fragment>
                <Dropdown overlay={this.makeMultiOperator()} trigger={['click']}>
                  <Button icon="menu-fold" style={{ fontSize: '12px' }}>
                    批量操作
                  </Button>
                </Dropdown>
                <span>{`已选择${selectedRowsReal.length}条`}</span>
              </React.Fragment>
            )}
        </div>
        <div className={styles.filterTableOperator} style={{ alignSelf: 'flex-end' }}>
          {extraOperatorRight || null}
        </div>
      </div>
    );
  }
}

export default Operator;
