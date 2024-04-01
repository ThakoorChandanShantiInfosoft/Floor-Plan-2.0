import React from 'react';
import ResizableRect from 'react-resizable-rotatable-draggable-touch-v2';
import { DeleteOutlined } from '@ant-design/icons';

const ResizableContent = ({ index, top, left, width, height, rotateAngle, containerWidth, containerHeight, onUpdate, onDelete, name }) => {

  const handleResize = (styleSize, isShiftKey, type, event) => {
    const { top, left, width, height } = styleSize.style;
    onUpdate(index, { top, left, width, height, rotateAngle });
  };

  const handleRotate = (rotateState, event) => {
    onUpdate(index, { top, left, width, height, rotateAngle: rotateState.rotateAngle });
  };

  const handleDrag = (dragState, event) => {
    const { deltaX, deltaY } = dragState;
    const newLeft = Math.min(Math.max(0, left + deltaX), containerWidth - width);
    const newTop = Math.min(Math.max(0, top + deltaY), containerHeight - height);
    onUpdate(index, { top: newTop, left: newLeft, width, height, rotateAngle });
  };


  const tooltipStyle = {
    position: 'absolute',
    top: top + height / 2 - 10,
    left: left + width / 2 - 25, 
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    padding: '5px',
    backgroundColor: '#F5F5F5',
    borderRadius: '5px',
    zIndex: 3,
    fontSize: '10px',
    fontWeight: '650',
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top,
          left,
          width,
          height,
          transform: `rotate(${rotateAngle}deg)`,
        }}
      ></div>
      <div style={tooltipStyle}>
        <div>{name}</div>
        <DeleteOutlined onClick={() => onDelete(index)} style={{ fontSize: '12px', marginLeft: '5px', color: 'red' }} />
      </div>
      <ResizableRect
        top={top}
        left={left}
        width={width}
        height={height}
        rotateAngle={rotateAngle}
        onResize={handleResize}
        onRotate={handleRotate}
        onDrag={handleDrag}
        zoomable="n, w, s, e, nw, ne, se, sw"
      />
    </>
  );
};

export default ResizableContent;
