import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import moment from 'moment';
import { convertTimeDis } from '../../../utils/utils';
import OATable from '../../../components/OATable';

const type = 'all';
@connect(({ loading, start, cc }) => ({
  listLoading: loading.effects['cc/fetchCCList'],
  ccList: cc.ccList,
  availableFlows: start.availableFlows,
}))
class CCList extends Component {
  componentWillMount() {
    this.fetchCCList({ page: 1, pagesize: 10 });
  }

  fetchCCList = params => {
    const { dispatch } = this.props;
    dispatch({
      type: 'cc/fetchCCList',
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
          // const { availableFlows } = this.props;
          const flow = (availableFlows || []).find(item => item.id === a);
          return flow ? flow.name : '';
        },
      },
      {
        title: '流程名称',
        dataIndex: 'flow_name',
        key: 'flow_name',
        searcher: true,
      },
      {
        title: '抄送时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        dateFilters: true,
        sorter: true,
      },
      {
        title: '步骤名称',
        dataIndex: 'step_name',
        key: 'step_name',
        searcher: true,
      },

      {
        title: '历时',
        render: a => {
          const disTime = a.updated_at
            ? convertTimeDis(moment().format('YYYY-MM-DD h:mm:ss'), a.updated_at)
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

  render() {
    const { listLoading, ccList } = this.props;
    const { data, total } = ccList;
    return (
      <div>
        <OATable
          serverSide
          loading={listLoading}
          columns={this.makeColums()}
          data={data}
          fetchDataSource={this.fetchCCList}
          total={total || 0}
        />
      </div>
    );
  }
}

export default CCList;
