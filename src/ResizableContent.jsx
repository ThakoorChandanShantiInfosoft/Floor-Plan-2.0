import React, { useState } from 'react';
import ResizableRect from 'react-resizable-rotatable-draggable-touch-v2';
import { DeleteOutlined } from '@ant-design/icons';

const ResizableContent = ({ index, top, left, width, height, rotateAngle, containerWidth, containerHeight, onUpdate, onDelete, name }) => {
  const [sizeMultiplier, setSizeMultiplier] = useState(1);

  const handleResize = (styleSize, isShiftKey, type, event) => {
    const { width: newWidth, height: newHeight } = styleSize.style;
    const newMultiplier = Math.min(newWidth / 85, newHeight / 55);
    const maxMultiplier = 1.5;
    const limitedMultiplier = Math.min(newMultiplier, maxMultiplier);
    setSizeMultiplier(limitedMultiplier);
    onUpdate(index, { ...styleSize.style, rotateAngle });
  };

  const handleRotate = (rotateState, event) => {
    const newRotateAngle = rotateState.rotateAngle;
    const radians = (rotateState.rotateAngle * Math.PI) / 180;
    const cosAngle = Math.cos(radians);
    const sinAngle = Math.sin(radians);
    const tooltipLeft = left + (width / 2) * (1 - cosAngle) - (height / 2) * sinAngle;
    const tooltipTop = top + (height / 2) * (1 - cosAngle) + (width / 2) * sinAngle;
    onUpdate(index, { rotateAngle: newRotateAngle, tooltipTop, tooltipLeft });
  };

  const handleDrag = (dragState, event) => {
    const { deltaX, deltaY } = dragState;
    const newLeft = Math.min(Math.max(0, left + deltaX), containerWidth - width);
    const newTop = Math.min(Math.max(0, top + deltaY), containerHeight - height);
    onUpdate(index, { top: newTop, left: newLeft, width, height, rotateAngle });
  };

  const tooltipStyle = {
    position: 'absolute',
    top: top + height / 2 - 10 * sizeMultiplier,
    left: left + width / 2 - 25 * sizeMultiplier,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: `${5 * sizeMultiplier}px`,
    backgroundColor: '#F5F5F5',
    borderRadius: `${5 * sizeMultiplier}px`,
    zIndex: 3,
    fontSize: `${10 * sizeMultiplier}px`,
    fontWeight: '650',
    transform: `rotate(${rotateAngle}deg)`
  };

  return (
    <>
      <div style={tooltipStyle}>
        <div style={{ fontSize: `${12 * sizeMultiplier}px` }}>{name}</div>
        <DeleteOutlined onClick={() => onDelete(index)} style={{ fontSize: `${12 * sizeMultiplier}px`, marginLeft: `${5 * sizeMultiplier}px`, color: 'red' }} />
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
