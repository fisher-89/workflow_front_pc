import React, { PureComponent } from 'react';
import styles from './detail.less';
import Ellipsis from '../Ellipsis';

const smXRatio = 60;
const smYRatio = 40;
class DetailItem extends PureComponent {
  state = {};

  render() {
    const {
      children,
      className,
      col,
      tooltip,
      row,
      template,
      name,
      extraStyle,
      asideStyle,
      rightStyle,
      rightContStyle,
    } = this.props;
    const itemStyle = {
      ...(template
        ? {
            width: `${col * smXRatio}px`,
            height: `${row * smYRatio}px`,
          }
        : { height: 'auto', width: `${5 * smXRatio}px` }),
      ...extraStyle,
      // borderBottom:'1px solid #ccc'
    };

    const classnames = [styles.form_item, className].join(' ');
    const rightSty = {
      ...(template
        ? { height: `${row * smYRatio}px`, overflowX: 'hidden', overflowY: 'scroll' }
        : null),
    };
    // {/* {children} */}
    // <div style={{ backgroundColor:'rgba(153,153,153,0.1)',
    // backgroundOrigin:'padding-box'}}

    return (
      <div className={classnames} style={itemStyle}>
        <div className={styles.item}>
          <div className={styles.aside} style={asideStyle}>
            {' '}
            {name}：
          </div>{' '}
          <div className={styles.right} style={{ ...rightSty, ...rightStyle }}>
            <div
              style={{
                padding: '5px 0 5px 10px',
                height: '100%',
                background: 'rgba(153,153,153,0.05)',
                ...rightContStyle,
              }}
            >
              {template ? (
                <Ellipsis
                  tooltip={tooltip ? { placement: 'topLeft' } : false}
                  lines={Math.floor((row * smYRatio - 20) / 20)}
                >
                  {children}
                </Ellipsis>
              ) : (
                children
              )}
            </div>{' '}
            {/* <div
                              id={`rightcontent${this.props.id}`} 
                              style={{maxHeight:`${Math.floor((row * smYRatio - 30) / 20) * 20}px`,position:'relative',overflow:'hidden'}}
                            >
                              {m}{textOver ?<span style={{position:'absolute',height:'20px',lineHeight:'20px',right:0,bottom:0,zIndex:10,background:'#fff'}}>...</span>:null}
                            </div> */}
          </div>
        </div>
      </div>
    );
  }
}
DetailItem.defaultProps = {
  asideStyle: {},
  rightStyle: {},
  tooltip: true,
};
export default DetailItem;
