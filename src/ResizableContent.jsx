import React, { useState, useEffect } from "react";
import ResizableRect from "react-resizable-rotatable-draggable-touch-v2";
import { Tooltip } from "@material-ui/core";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import InfoIcon from "@material-ui/icons/Info";

const ResizableContent = ({
  beds,
  bed,
  index,
  top,
  left,
  width,
  height,
  rotateAngle,
  containerWidth,
  containerHeight,
  onUpdate,
  onDelete,
  onEdit,
  name,
  patientDetails,
}) => {
  const [sizeMultiplier, setSizeMultiplier] = useState(1);
  const [startPosition, setStartPosition] = useState({ left, top });
  const [forceRerender, setForceRerender] = useState(false);

  useEffect(() => {
    if (forceRerender) {
      setForceRerender(false);
    }
  }, [forceRerender]);

  const handleResize = (styleSize, isShiftKey, type, event) => {
    const { width: newWidth, height: newHeight } = styleSize.style;
    const newMultiplier = Math.min(newWidth / 85, newHeight / 55);
    const maxMultiplier = 1.5;
    const limitedMultiplier = Math.min(newMultiplier, maxMultiplier);
    setSizeMultiplier(limitedMultiplier);
    onUpdate(index, { ...styleSize.style, rotateAngle });
  };

  const handleRotate = (rotateState, event) => {
    onUpdate(index, { rotateAngle: rotateState.rotateAngle });
  };

  const handleDragStart = () => {
    setStartPosition({ left, top });
  };

  const handleDrag = (dragState, event) => {
    const { deltaX, deltaY } = dragState;
    const newLeft = Math.min(
      Math.max(0, left + deltaX),
      containerWidth - width
    );
    const newTop = Math.min(
      Math.max(0, top + deltaY),
      containerHeight - height
    );

    const overlapBed = beds.find((otherBed) => {
      if (otherBed?.index === index) return false;
      return (
        newLeft < otherBed?.left + otherBed?.width &&
        newLeft + width > otherBed?.left &&
        newTop < otherBed?.top + otherBed?.height &&
        newTop + height > otherBed?.top
      );
    });

    if (
      overlapBed &&
      !overlapBed?.patientDetails?.name &&
      bed?.patientDetails?.name
    ) {
      // Transfer patient details to the overlapped bed
      onUpdate(overlapBed?.index, {
        ...overlapBed,
        patientDetails: bed.patientDetails,
      });
      // Clear patient details from the current bed and reset its position
      onUpdate(index, {
        ...startPosition,
        width,
        height,
        rotateAngle,
        patientDetails: { name: "", age: "", condition: "" },
      });
      setForceRerender(true); // Force re-render to reset dragging state
    } else {
      // No overlapping or conditions not met, just update the current position
      onUpdate(index, {
        top: newTop,
        left: newLeft,
        width,
        height,
        rotateAngle,
      });
    }
  };

  const tooltipStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: "none",
    fontSize: `${12 * sizeMultiplier}px`,
    fontWeight: "650",
    transform: `rotate(${rotateAngle}deg)`,
    zIndex: 3,
  };

  const iconStyle = {
    pointerEvents: "auto",
    fontSize: `${12 * sizeMultiplier}px`,
    marginLeft: `${5 * sizeMultiplier}px`,
    cursor: "pointer",
  };

  return (
    <>
      <div style={tooltipStyle}>
        <div style={{ fontSize: `${12 * sizeMultiplier}px` }}>{name}</div>
        <EditOutlined
          onClick={() => onEdit(index, name)}
          style={{ ...iconStyle, color: "blue" }}
        />
        <DeleteOutlined
          onClick={() => onDelete(index)}
          style={{ ...iconStyle, color: "red" }}
        />
        {patientDetails && patientDetails.name && (
          <Tooltip
            style={{ fontSize: `${12 * sizeMultiplier}px` }}
            title={`Name: ${patientDetails.name}, Age: ${patientDetails.age}, Condition: ${patientDetails.condition}`}
          >
            <InfoIcon style={{ ...iconStyle, color: "blue" }} />
          </Tooltip>
        )}
      </div>
      <ResizableRect
        key={forceRerender}
        top={top}
        left={left}
        width={width}
        height={height}
        rotateAngle={rotateAngle}
        onResize={handleResize}
        onRotate={handleRotate}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        zoomable="n, w, s, e, nw, ne, se, sw"
      />
    </>
  );
};

export default ResizableContent;
