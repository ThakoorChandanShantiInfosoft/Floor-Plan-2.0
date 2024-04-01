import _isNil from 'lodash/isNil';
import { Button } from 'antd';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import ResizableContent from './ResizableContent';
import './App.css';

function App() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(
    () => JSON.parse(localStorage.getItem('position')) || { x: 0, y: 0 }
  );

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [beds, setBeds] = useState(
    () => JSON.parse(localStorage.getItem('beds')) || []
  );
  const [imageURL, setImageURL] = useState(
    () => {
      const storedImageURL = localStorage.getItem('imageURL');
      return storedImageURL === "null" ? null : storedImageURL;
    }
  );

  const [scale, setScale] = useState(
    () => parseFloat(localStorage.getItem('scale')) || 1
  );

  useEffect(() => {
    localStorage.setItem('beds', JSON.stringify(beds));
    localStorage.setItem('imageURL', imageURL);
    localStorage.setItem('scale', scale.toString());
    localStorage.setItem('position', JSON.stringify(position));
  }, [beds, imageURL, scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const newPos = {
      x: e.clientX - dragStart.x - containerRef.current.getBoundingClientRect().left,
      y: e.clientY - dragStart.y - containerRef.current.getBoundingClientRect().top,
    };
    setPosition(newPos);
  }, [isDragging, dragStart]);

  useEffect(() => {
    const handleMouseUpWindow = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUpWindow);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUpWindow);
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
        const newScale = Math.min(Math.max(.5, scale + scaleAdjustment), 4);
        setScale(newScale);
      };
      container.addEventListener('wheel', handleWheel);
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [scale]);

  const handleReset = () => {
    setBeds([]);
    setImageURL(null);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    localStorage.removeItem('beds');
    localStorage.removeItem('imageURL');
    localStorage.removeItem('scale');
    localStorage.removeItem('position');
  };

  const removeBed = (indexToRemove) => {
    setBeds(beds.filter((_, index) => index !== indexToRemove));
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
      x: e.clientX - rect.left - position.x, // Adjust for the current position
      y: e.clientY - rect.top - position.y,  // Adjust for the current position
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const updateBed = (index, updatedProps) => {
    setBeds(currentBeds => currentBeds.map((bed, i) => i === index ? { ...bed, ...updatedProps } : bed));
  };

  const renderBeds = () => {
    return beds.map((bed, index) => (
      <ResizableContent
        key={index}
        index={index}
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
      <div className='buttons-container'>
        <Button type="primary" onClick={() => fileInputRef.current.click()}>
          Upload Image
        </Button>
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
          ref={fileInputRef}
        />
        <Button disabled={!imageURL} onClick={() => setBeds([...beds, {
          top: 30,
          left: 150,
          width: 150,
          height: 50,
          rotateAngle: 0,
          name: "Bed " + (beds.length + 1),
        }])}>
          Add Bed
        </Button>
        <Button disabled={!imageURL} onClick={handleReset}>
          Reset
        </Button>
      </div>
      <div className='parent-container' ref={containerRef} onMouseUp={handleMouseUp}>
        {!_isNil(imageURL) ? (
          <div
            className="container"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
          >
            <img src={imageURL} alt="UploadedImage" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            {renderBeds()}
          </div>
        ) : ''}
      </div>
    </>
  );
}

export default App;