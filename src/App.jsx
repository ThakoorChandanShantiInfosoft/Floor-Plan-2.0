import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Dialog,
  TextField,
  Button,
} from "@material-ui/core";
import ResizableContent from "./ResizableContent";
import "./App.css";

function App() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => JSON.parse(localStorage.getItem("position")) || { x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [beds, setBeds] = useState(() => JSON.parse(localStorage.getItem("beds")) || []);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [currentBedIndex, setCurrentBedIndex] = useState(null);
  const [patientDetails, setPatientDetails] = useState({ name: "", age: "", condition: "" });
  const [imageURL, setImageURL] = useState(() => {
    const storedImageURL = localStorage.getItem("imageURL");
    return storedImageURL === "null" ? null : storedImageURL;
  });
  const [scale, setScale] = useState(() => parseFloat(localStorage.getItem("scale")) || 1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bedName, setBedName] = useState("");
  const [isBedNameEmpty, setIsBedNameEmpty] = useState(true);
  const [editingBedIndex, setEditingBedIndex] = useState(null);
  const [isNameTooLong, setIsNameTooLong] = useState(false);

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
      setContainerSize({ width: container.offsetWidth, height: container.offsetHeight });
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
    setEditingBedIndex(null);
    setBedName("");
    setIsBedNameEmpty(true);
    setIsModalVisible(true);
  };

  const handleDoubleClick = (index) => {
    setCurrentBedIndex(index);
    setIsPatientModalOpen(true);
    const bed = beds.find((bed) => bed.index === index);
    setPatientDetails(bed?.patientDetails || { name: "", age: "", condition: "" });
  };

  const handleSavePatientDetails = () => {
    const updatedBeds = beds.map((bed) =>
      bed.index === currentBedIndex ? { ...bed, patientDetails: { ...patientDetails } } : bed
    );
    setBeds(updatedBeds);
    setIsPatientModalOpen(false);
    localStorage.setItem("beds", JSON.stringify(updatedBeds));
  };

  const handleEditBed = (index) => {
    const bedToEdit = beds.find((bed) => bed.index === index);
    if (bedToEdit) {
      setBedName(bedToEdit.name);
      setIsBedNameEmpty(bedToEdit.name.trim() === "");
      setEditingBedIndex(index);
      setIsModalVisible(true);
    }
  };

  const handleModalOk = () => {
    if (editingBedIndex !== null) {
      const updatedBeds = beds.map((bed) =>
        bed.index === editingBedIndex ? { ...bed, name: bedName } : bed
      );
      setBeds(updatedBeds);
      setEditingBedIndex(null);
    } else {
      const containerRect = containerRef.current.getBoundingClientRect();
      const bedWidth = 150;
      const bedHeight = 50;
      const centerLeft = (containerRect.width / scale - bedWidth) / 2;
      const centerTop = (containerRect.height / scale - bedHeight) / 2;

      const newIndex = beds.length > 0 ? beds[beds.length - 1].index + 1 : 1;

      setBeds([
        ...beds,
        {
          index: newIndex,
          top: centerTop,
          left: centerLeft,
          width: bedWidth,
          height: bedHeight,
          rotateAngle: 0,
          name: bedName,
        },
      ]);
    }
    setIsModalVisible(false);
    setBedName("");
    setIsBedNameEmpty(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingBedIndex(null);
    setBedName("");
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

  const handleBedNameChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 10) {
      setBedName(inputValue);
      setIsBedNameEmpty(inputValue.trim() === "");
      setIsNameTooLong(false);
    } else {
      setIsNameTooLong(true);
    }
  };

  const renderBeds = () => {
    return beds.map((bed, index) => (
      <div key={bed.index} onDoubleClick={() => handleDoubleClick(bed.index)}>
        <ResizableContent
          beds={beds}
          bed={bed}
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
          onEdit={handleEditBed}
          patientDetails={bed.patientDetails}
        />
      </div>
    ));
  };

  return (
    <>
      <div className="buttons-container">
        <button className="upload-button" type="button" onClick={() => fileInputRef.current.click()}>
          Upload Image
        </button>
        <input type="file" style={{ display: "none" }} onChange={handleImageUpload} ref={fileInputRef} />
        <button className="add-button" disabled={!imageURL} onClick={handleAddBed}>
          Add Bed
        </button>
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="parent-container" ref={containerRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {!imageURL ? null : (
          <div
            className="container"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            <img
              src={imageURL}
              alt="Uploaded"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            {renderBeds()}
            <Dialog open={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)}>
              <div style={{ padding: "20px" }}>
                <h2>Add Patient</h2>
                <TextField
                  label="Name"
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Age"
                  value={patientDetails.age}
                  onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Condition"
                  value={patientDetails.condition}
                  onChange={(e) => setPatientDetails({ ...patientDetails, condition: e.target.value })}
                  fullWidth
                />
                <Button
                  onClick={handleSavePatientDetails}
                  disabled={!patientDetails.name || !patientDetails.age || !patientDetails.condition}
                  color="primary"
                  variant="contained"
                  style={{ marginTop: '20px' }}
                >
                  Save
                </Button>
              </div>
            </Dialog>
          </div>
        )}
      </div>
      {isModalVisible && (
        <div className="custom-modal">
          <div className="modal-content">
            <span className="close" onClick={handleModalCancel}>&times;</span>
            <h2>{editingBedIndex !== null ? "Edit Bed Name" : "Enter Bed Name"}</h2>
            <input
              className={`modal-input ${isNameTooLong ? "input-error" : ""}`}
              type="text"
              placeholder="Enter Bed Name"
              value={bedName}
              onChange={handleBedNameChange}
            />
            {isNameTooLong && <div className="error-message">Name cannot be more than 10 characters</div>}
            <button
              className={`modal-ok-button ${isBedNameEmpty ? "disabled" : ""}`}
              onClick={handleModalOk}
              disabled={isBedNameEmpty}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
