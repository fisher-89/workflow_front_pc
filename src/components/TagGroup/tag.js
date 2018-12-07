import React from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import style from './index.less';

class Tag extends React.Component {
  constructor(props) {
    super(props);
    const { value } = props;
    this.state = {
      onEditing: false,
      inputValue: value,
    };
  }

  componentWillReceiveProps(props) {
    const { value, onEditing } = props;
    const oldValue = this.props.value;
    if (value !== oldValue) {
      this.setState({ inputValue: value });
    }
    if (onEditing !== this.props.onEditing) {
      this.setState({ onEditing });
    }
  }

  handleInputChange = e => {
    const { value } = e.target;
    this.setState({
      inputValue: value,
    });
  };

  showInput = () => {
    this.setState(
      {
        onEditing: true,
      },
      () => this.textInput.focus()
    );
  };

  render() {
    const { onEditing, inputValue } = this.state;
    const { handleClose, disabled } = this.props;
    const cls = classNames(style.item, {
      [style.readonly]: disabled,
    });
    const editStyle = onEditing
      ? {
          paddingRight: '35px',
          display: 'flex',
          alignItem: 'center',
        }
      : { display: 'none' };
    const itemStyle = {
      ...editStyle,
    };
    return (
      <div className={style.tag_item}>
        <div className={style.item} style={{ ...itemStyle }}>
          <input
            className={style.editInput}
            value={`${inputValue || ''}`}
            onChange={this.handleInputChange}
            ref={e => {
              this.textInput = e;
            }}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                this.props.handleBlur(this.props.index)(e);
              }
            }}
            onBlur={this.props.handleBlur(this.props.index)}
            onFocus={() => this.props.handleFocus(this.props.index)}
          />
        </div>
        {!onEditing && (
          <div className={cls}>
            <Tooltip placement="topLeft" title={inputValue}>
              <p onClick={!disabled ? this.showInput : null}>{inputValue}</p>
            </Tooltip>
            {!disabled && <span onClick={() => handleClose(inputValue)} />}
          </div>
        )}
      </div>
    );
  }
}

export default Tag;
