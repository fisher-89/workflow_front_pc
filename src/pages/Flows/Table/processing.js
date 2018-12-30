import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Popconfirm, Divider } from 'antd';
import { Link } from 'dva/router';
import moment from 'moment';

import { last } from 'lodash';
import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'processing';
@connect(({ loading, start }) => ({
  listLoading: loading.effects['start/fetchStartList'],
  processingStart: start.processingStart || {},
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

  withDraw = r => {
    const { dispatch } = this.props;
    dispatch({
      type: 'start/doWithDraw',
      payload: {
        params: {
          flow_run_id: r.id,
        },
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
        title: '当前审批人',
        dateFilters: true,
        searcher: true,
        render: a => {
          const stepRun = a.step_run;
          return stepRun.length > 0 ? last(stepRun).approver_name : '';
        },
      },
      {
        title: '历时',
        render: a => {
          const disTime = a.created_at
            ? convertTimeDis(moment().format('YYYY-MM-DD h:mm:ss'), a.created_at)
            : '';
          return disTime;
        },
      },
      {
        title: '操作',
        render: r => (
          <Fragment>
            <Link to={`/start/${r.id}`}>查看</Link>
            {r.status === 0 ? (
              <Fragment>
                <Divider type="vertical" />
                <Popconfirm onConfirm={() => this.withDraw(r)} title="确定要撤回该流程吗？">
                  <a>撤回</a>
                </Popconfirm>
              </Fragment>
            ) : null}
          </Fragment>
        ),
      },
    ];
    return columns;
  };

  render() {
    const { listLoading } = this.props;
    const { processingStart } = this.props;
    console.log('processingStart: ', processingStart);
    const { data, total } = processingStart;
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
