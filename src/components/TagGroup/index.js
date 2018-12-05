import React from 'react';
// import { Toast } from 'antd-mobile';
import Tag from './tag';
import { isJSON } from '../../utils/utils';
import style from './index.less';

export default class TagGroup extends React.Component {
  constructor(props) {
    super(props);
    const { value } = props;
    let newValue = [];
    if (typeof value === 'object' && value) {
      newValue = value;
    } else {
      newValue = isJSON(value) || [];
    }
    this.state = {
      onEditing: false,
      inputValue: '',
      tags: newValue,
      tagEdit: false,
    };
  }

  componentWillReceiveProps(props) {
    const { value } = props;
    const oldValue = this.props.value;
    if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
      const tags = value;
      this.setState({ tags });
    }
  }

  uniqueValue = (e, index) => {
    let { tags } = { ...this.state };
    const { value } = e.target;
    if (index !== undefined) {
      tags = tags.filter((_, tagIndex) => tagIndex !== index);
    }
    return value && tags.indexOf(value) === -1;
  };

  handleInputChange = e => {
    const { value } = e.target;
    this.setState({ inputValue: value });
  };

  handleTagEditBlur = index => e => {
    const { value } = e.target;
    if (value) {
      if (value && this.uniqueValue(e, index)) {
        this.setState({ tagEdit: false }, () => {
          this.editTagValue(value, index);
        });
      } else {
        e.preventDefault();
        this.setState({ tagEdit: index }, () => {
          // Toast.info('请勿重复添加', 1);
        });
        e.target.focus();
      }
    } else {
      const { tags } = this.state;
      const tag = tags[index];
      this.handleClose(tag, index);
    }
  };

  handleClose = (removedTag, index) => {
    const {
      range: { min },
      onChange,
    } = this.props;
    const { tags } = this.state;
    if (min && min - tags.length >= 0) {
      // Toast.info(`请至少添加${min}个`, 1);
    }
    // const newTags = tags.filter((tag,index) => `${tag}` !== `${removedTag}`);
    const newTags = tags.filter((tag, i) => `${i}` !== `${index}`);
    this.setState({ tags: newTags, tagEdit: false }, () => {
      onChange(newTags);
    });
  };

  handleAddTageBlur = e => {
    const { value } = e.target;
    const { tags } = this.state;
    const { onChange } = this.props;
    let newTags = [...tags];
    if (value) {
      if (this.uniqueValue(e)) {
        newTags = [...tags, value.length >= 10 ? value.slice(0, 10) : value];
      } else {
        e.preventDefault();
        // Toast.info('请勿重复添加', 1);
        e.target.focus();
      }
    }
    if (!value || (value && this.uniqueValue(e))) {
      this.setState({ onEditing: false, tags: newTags, inputValue: '' }, () => {
        onChange(newTags);
      });
    }
  };

  editTagValue = (value, index) => {
    const { tags } = this.state;
    tags.splice(index, 1, value);
    this.setState({ tags });
  };

  showInput = () => {
    this.setState(
      {
        onEditing: true,
      },
      () => this.textInput.focus()
    );
  };

  makeTagProps = (value, index) => {
    const { readonly, range } = this.props;
    const { tagEdit } = this.state;
    const props = {
      index,
      range,
      value,
      readonly,
      key: index,
      onEditing: tagEdit === index,
      handleClose: v => this.handleClose(v, index),
      handleBlur: () => this.handleTagEditBlur(index),
      onChange: v => this.editTagValue(v, index),
      handleFocus: () => {
        this.setState({ tagEdit: index });
      },
    };
    return props;
  };

  renderTag = () => {
    const { tags } = this.state;
    return tags.map((item, i) => {
      const props = this.makeTagProps(item, i);
      return <Tag {...props} />;
    });
  };

  render() {
    const { onEditing, inputValue, tags } = this.state;
    const {
      readonly,
      range: { max },
    } = this.props;
    const editStyle = onEditing
      ? {
          paddingRight: '35px',
          display: 'flex',
          alignItem: 'center',
        }
      : {};
    const itemStyle = {
      border: '1px dashed #c7c7c7',
      ...editStyle,
    };
    return (
      <div className={style.contain}>
        {this.renderTag()}
        {!readonly &&
          tags.length - max < 0 && (
            <div className={style.item} style={{ ...itemStyle }}>
              {onEditing && (
                <input
                  className={style.editInput}
                  value={inputValue}
                  ref={e => {
                    this.textInput = e;
                  }}
                  onKeyDown={e => {
                    if (e.keyCode === 13) {
                      this.handleAddTageBlur(e);
                    }
                  }}
                  onChange={this.handleInputChange}
                  onBlur={this.handleAddTageBlur}
                />
              )}
              {onEditing ? null : <p onClick={this.showInput}>+添加</p>}
            </div>
          )}
      </div>
    );
  }
}

TagGroup.defaultProps = {
  readonly: false,
  range: { min: 1, max: 10 },
  onChange: () => {},
};
