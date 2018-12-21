import React, { PureComponent } from 'react';
import { Tree } from 'antd';

const { TreeNode } = Tree;
class MutiTreeSelect extends PureComponent {
  constructor(props) {
    super(props);
    const { checkedKeys } = this.props;
    this.state = {
      autoExpandParent: true,
      checkedKeys,
    };
  }

  componentWillReceiveProps(props) {
    const { checkedKeys } = props;
    if (JSON.stringify(checkedKeys) !== this.props.checkedKeys) {
      this.setState({
        checkedKeys,
      });
    }
  }

  onCheck = checkedKeys => {
    this.setState({ checkedKeys }, () => {
      this.props.onChange(checkedKeys);
    });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });

  render() {
    const { treeData } = this.props;
    return (
      <Tree
        checkable
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
        onSelect={this.onSelect}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    );
  }
}
MutiTreeSelect.defaultProps = {
  treeData: [],
};
export default MutiTreeSelect;
