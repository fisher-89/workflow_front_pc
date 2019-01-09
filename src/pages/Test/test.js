import React, { PureComponent } from 'react';

class Test extends PureComponent {
  componentWillMount() {
    console.log('test');
  }

  render() {
    return (
      <div style={{ width: '902px', position: 'relative', background: 'seagreen' }}>
        <div
          style={{
            width: '600px',
            background: 'red',
            minHeight: '150px',
            position: 'relative',
            top: 0,
            left: '301px',
          }}
        >
          1
        </div>
        <div
          style={{
            width: '300px',
            background: 'blue',
            minHeight: '75px',
            position: 'absolute',
            top: 0,
            left: '1px',
          }}
        >
          2
        </div>
        <div
          style={{
            width: '300px',
            background: 'pink',
            minHeight: '75px',
            position: 'absolute',
            top: 75,
            left: '1px',
          }}
        >
          3
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    );
  }
}
export default Test;
