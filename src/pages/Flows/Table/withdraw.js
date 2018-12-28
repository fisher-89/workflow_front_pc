import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import OATable from '../../../components/OATable';

const type = 'withdraw';
@connect(({ loading, start }) => ({
  listLoading: loading.effects['start/fetchStartList'],
  withdrawStart: start.withdrawStart,
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
        title: '撤回时间',
        dataIndex: 'end_at',
        key: 'end_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '备注',
        searcher: true,
        render: () => '备注',
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
    const { withdrawStart } = this.props;
    const { data, total } = withdrawStart;
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
