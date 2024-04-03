// App.js

import _isNil from "lodash/isNil";
import React, { useRef, useState, useEffect, useCallback } from "react";
import ResizableContent from "./ResizableContent";
import "./App.css";

function App() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(
    () => JSON.parse(localStorage.getItem("position")) || { x: 0, y: 0 }
  );

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [beds, setBeds] = useState(
    () => JSON.parse(localStorage.getItem("beds")) || []
  );
  const [imageURL, setImageURL] = useState(() => {
    const storedImageURL = localStorage.getItem("imageURL");
    return storedImageURL === "null" ? null : storedImageURL;
  });

  const [scale, setScale] = useState(
    () => parseFloat(localStorage.getItem("scale")) || 1
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bedName, setBedName] = useState("");

  useEffect(() => {
    localStorage.setItem("beds", JSON.stringify(beds));
    localStorage.setItem("imageURL", imageURL);
    localStorage.setItem("scale", scale.toString());
    localStorage.setItem("position", JSON.stringify(position));
  }, [beds, imageURL, scale, position]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const newPos = {
        x:
          e.clientX -
          dragStart.x -
          containerRef.current.getBoundingClientRect().left,
        y:
          e.clientY -
          dragStart.y -
          containerRef.current.getBoundingClientRect().top,
      };
      setPosition(newPos);
    },
    [isDragging, dragStart]
  );

  useEffect(() => {
    const handleMouseUpWindow = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUpWindow);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUpWindow);
    };
  }, [isDragging, handleMouseMove]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      setContainerSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
      const handleWheel = (e) => {
        e.preventDefault();
        const scaleAdjustment = e.deltaY * -0.01;
        const newScale = Math.min(Math.max(0.5, scale + scaleAdjustment), 4);
        setScale(newScale);
      };
      container.addEventListener("wheel", handleWheel);
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, [scale]);

  const handleAddBed = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    const parentContainer = containerRef.current;
    if (parentContainer) {
      const parentRect = parentContainer.getBoundingClientRect();
      const centerLeft = (parentRect.width - 150) / 2;
      const centerTop = (parentRect.height - 50) / 2;

      const newIndex =
        beds.length > 0 ? beds[beds.length - 1].index + 1 : 1;

      setBeds([
        ...beds,
        {
          index: newIndex,
          top: centerTop,
          left: centerLeft,
          width: 150,
          height: 50,
          rotateAngle: 0,
          name: bedName,
        },
      ]);
    }
    setBedName("");
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleReset = () => {
    setBeds([]);
    setImageURL(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem("beds");
    localStorage.removeItem("imageURL");
    localStorage.removeItem("scale");
    localStorage.removeItem("position");
  };

  const removeBed = (indexToRemove) => {
    setBeds(beds.filter((bed) => bed.index !== indexToRemove));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const updateBed = (index, updatedProps) => {
    setBeds((currentBeds) =>
      currentBeds.map((bed) =>
        bed.index === index ? { ...bed, ...updatedProps } : bed
      )
    );
  };

  const renderBeds = () => {
    return beds.map((bed) => (
      <ResizableContent
        key={bed.index}
        index={bed.index}
        name={bed.name}
        top={bed.top}
        left={bed.left}
        width={bed.width}
        height={bed.height}
        rotateAngle={bed.rotateAngle}
        containerWidth={containerSize.width}
        containerHeight={containerSize.height}
        onUpdate={updateBed}
        onDelete={removeBed}
      />
    ));
  };

  return (
    <>
    <div className="buttons-container">
      <button className="upload-button" type="button" onClick={() => fileInputRef.current.click()}>
        Upload Image
      </button>
      <input
        type="file"
        style={{ display: "none" }}
        onChange={handleImageUpload}
        ref={fileInputRef}
      />
      <button className="add-button" disabled={!imageURL} onClick={handleAddBed}>
        Add Bed
      </button>
      <button className="reset-button" disabled={!imageURL} onClick={handleReset}>
        Reset
      </button>
    </div>
    <div
      className="parent-container"
      ref={containerRef}
      onMouseUp={handleMouseUp}
    >
      {!_isNil(imageURL) ? (
        <div
          className="container"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            src={imageURL}
            alt="UploadedImage"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          {renderBeds()}
        </div>
      ) : (
        ""
      )}
    </div>
    {isModalVisible && (
      <div ref={modalRef} className="custom-modal">
        <div className="modal-content">
          <span className="close" onClick={handleModalCancel}>
            &times;
          </span>
          <h2>Enter Bed Name</h2>
          <input
            className="modal-input"
            type="text"
            placeholder="Enter Bed Name"
            value={bedName}
            onChange={(e) => setBedName(e.target.value)}
          />
          <button className="modal-ok-button" onClick={handleModalOk}>OK</button>
        </div>
      </div>
    )}
  </>
  );
}

export default App;
