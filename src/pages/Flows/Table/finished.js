import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { last } from 'lodash';
import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'finished';
@connect(({ loading, start }) => ({
  listLoading: loading.effects['start/fetchStartList'],
  finishedStart: start.finishedStart || {},
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
        params: { ...(params || {}), type },
      },
    });
  };

  makeColums = () => {
    const { availableFlows } = this.props;

    const columns = [
      {
        title: '序号',
        dataIndex: 'id',
        key: 'id',
        sorter: true,
      },
      {
        title: '流程类型',
        dataIndex: 'flow_type_id',
        key: 'flow_type_id',
        filters: availableFlows.map(item => ({ text: item.name, value: item.id })),
        render: a => {
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
        title: '审批人',
        dateFilters: true,
        searcher: true,
        render: a => {
          const stepRun = a.step_run;
          return last(stepRun).approver_name;
        },
      },
      {
        title: '备注',
        dateFilters: true,
        searcher: true,
        render: a => {
          const stepRun = a.step_run;
          return last(stepRun).remark;
        },
      },
      {
        title: '审批时间',
        dataIndex: 'end_at',
        key: 'end_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '历时',
        render: a => {
          const disTime = a.end_at ? convertTimeDis(a.end_at, a.created_at) : '';
          return disTime;
        },
      },
      {
        title: '操作',
        render: ({ id }) => (
          <Fragment>
            <Link to={`/start/${id}`}>查看</Link>
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
          history.push(`/start/${item.id}`);
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
          history.push(`/start/${item.id}`);
        }}
      >
        撤回
      </span>
    );
  };

  render() {
    const { listLoading, finishedStart } = this.props;
    const { data, total } = finishedStart || {};
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
