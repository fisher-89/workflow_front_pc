import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';

import { last } from 'lodash';
import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'finished';
@connect(({ loading, start }) => ({
  listLoading: loading.effects['start/fetchStartList'],
  startListDetails: start.startListDetails,
  availableFlows: start.availableFlows,
}))
class StartList extends Component {
  componentWillMount() {
    this.fetchStartList({ page: 1, pagesize: 10 });
  }

  fetchStartList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'start/fetchStartList',
      payload: {
        params: { ...(params || {}), type: 'finished' },
      },
    });
  };

  widthDraw = id => {};

  makeColums = () => {
    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '流程类型',
        dataIndex: 'flow_type_id',
        key: 'flow_type_id',
        searcher: true,
        render: a => {
          const { availableFlows } = this.props;
          const flow = (availableFlows || []).find(item => item.id === a);
          return flow ? flow.name : '';
        },
      },
      {
        title: '流程名称',
        dataIndex: 'name',
        key: 'name',
        searcher: true,
      },
      {
        title: '发起时间',
        dataIndex: 'created_at',
        key: 'created_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '当前审批人',
        dateFilters: true,
        searcher: true,
        render: a => {
          const stepRun = a.step_run;
          return last(stepRun).approver_name;
        },
      },
      {
        title: '历时',
        render: a => {
          const disTime = a.end_at
            ? convertTimeDis(moment().format('YYYY-MM-DD h:mm:ss'), a.end_at)
            : '';
          return disTime;
        },
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/start_detail/${id}`}>查看</Link>
          </Fragment>
        ),
      },
    ];
    return columns;
  };

  makeDetailButton = item => {
    const { history } = this.props;
    return (
      <span
        key="detail"
        onClick={() => {
          history.push(`/start_detail/${item.id}`);
        }}
      >
        查看
      </span>
    );
  };

  makeWithDrawButton = item => {
    const { history } = this.props;
    return (
      <span
        key="withdraw"
        onClick={() => {
          history.push(`/start_detail/${item.id}`);
        }}
      >
        撤回
      </span>
    );
  };

  render() {
    const { listLoading } = this.props;
    const { startListDetails } = this.props;
    const list = startListDetails[type] || {};
    const { data, total } = list;
    return (
      <div>
        <OATable
          serverSide
          loading={listLoading}
          columns={this.makeColums()}
          data={data}
          fetchDataSource={this.fetchStartList}
          total={total || 0}
        />
      </div>
    );
  }
}

export default StartList;
