import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Moveable from "react-moveable";
import html2canvas from "html2canvas";
import { Button, Slider, Input, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8f8f8;
  min-height: 100vh;
`;

const ShirtArea = styled.div`
  position: relative;
  width: 400px;
  height: 500px;
  background-image: url("/img/1.jpg");
  background-size: cover;
  background-position: center;
  border: 2px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const UploadInput = styled.input`
  margin-bottom: 15px;
`;

export default function TShirtCustomizer() {
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeType, setActiveType] = useState("image");
  const [target, setTarget] = useState(null);
  const shirtRef = useRef();

  useEffect(() => {
    if (activeType === "image" && images[activeIndex]?.ref?.current) {
      setTarget(images[activeIndex].ref.current);
    } else if (activeType === "text" && texts[activeIndex]?.ref?.current) {
      setTarget(texts[activeIndex].ref.current);
    } else {
      setTarget(null);
    }
  }, [activeIndex, activeType, images, texts]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      src: URL.createObjectURL(file),
      top: 150,
      left: 100,
      width: 150,
      height: 150,
      rotation: 0,
      ref: React.createRef(),
    }));
    setImages((prev) => [...prev, ...newImages]);
    setActiveIndex(images.length);
    setActiveType("image");
  };

  const handleAddText = () => {
    const newText = {
      content: "New Text",
      top: 150,
      left: 100,
      width: 150,
      height: 50,
      rotation: 0,
      fontSize: 20,
      color: "#000000",
      ref: React.createRef(),
      editing: true,
    };
    setTexts((prev) => [...prev, newText]);
    setActiveIndex(texts.length);
    setActiveType("text");
  };

  const handleTextDoubleClick = (index) => {
    setTexts((prev) => {
      const updated = [...prev];
      updated[index].editing = true;
      return updated;
    });
  };

  const handleTextChange = (index, value) => {
    setTexts((prev) => {
      const updated = [...prev];
      updated[index].content = value;
      return updated;
    });
  };

  const handleTextBlur = (index) => {
    setTexts((prev) => {
      const updated = [...prev];
      updated[index].editing = false;
      return updated;
    });
  };

  const deleteItem = (type, index) => {
    if (type === "image")
      setImages((prev) => prev.filter((_, i) => i !== index));
    else setTexts((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex(null);
    setTarget(null);
  };

  const handleDownload = async () => {
    if (!shirtRef.current) return;

    // Hide all delete buttons and moveable borders
    const deleteBtns = document.querySelectorAll(".delete-btn");
    deleteBtns.forEach((el) => (el.style.display = "none"));
    const moveableEls = document.querySelectorAll(".moveable-control-box");
    moveableEls.forEach((el) => (el.style.display = "none"));

    // Capture canvas
    const canvas = await html2canvas(shirtRef.current, { useCORS: true });

    // Restore buttons and borders
    deleteBtns.forEach((el) => (el.style.display = "block"));
    moveableEls.forEach((el) => (el.style.display = "block"));

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "tshirt-design.png";
    link.click();
  };

  return (
    <Container>
      <h2></h2>

      <Controls>
        <UploadInput
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
        />
        <Button variant="outlined" onClick={handleAddText}>
          Add Text
        </Button>

        {activeType === "text" && activeIndex !== null && (
          <>
            <label>
              Font Size:
              <Slider
                value={texts[activeIndex].fontSize}
                min={10}
                max={100}
                onChange={(e, val) => {
                  setTexts((prev) => {
                    const updated = [...prev];
                    updated[activeIndex].fontSize = val;
                    return updated;
                  });
                }}
                style={{ width: 100, display: "inline-block", marginLeft: 5 }}
              />
            </label>
            <label>
              Color:
              <Input
                type="color"
                value={texts[activeIndex].color}
                onChange={(e) => {
                  setTexts((prev) => {
                    const updated = [...prev];
                    updated[activeIndex].color = e.target.value;
                    return updated;
                  });
                }}
                style={{ marginLeft: 5 }}
              />
            </label>
          </>
        )}
      </Controls>

      <ShirtArea ref={shirtRef}>
        {/* Images */}
        {images.map((img, index) => (
          <div
            key={index}
            ref={img.ref}
            style={{
              position: "absolute",
              top: img.top,
              left: img.left,
              width: img.width,
              height: img.height,
              transform: `rotate(${img.rotation}deg)`,
            }}
            onMouseDown={() => {
              setActiveIndex(index);
              setActiveType("image");
            }}
          >
            <img
              src={img.src}
              alt={`Design ${index}`}
              style={{ width: "100%", height: "100%", cursor: "move" }}
            />
            <IconButton
              size="small"
              className="delete-btn"
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                background: "#fff",
              }}
              onClick={() => deleteItem("image", index)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        ))}

        {/* Texts */}
        {texts.map((txt, index) => (
          <div
            key={index}
            ref={txt.ref}
            style={{
              position: "absolute",
              top: txt.top,
              left: txt.left,
              width: txt.width,
              height: txt.height,
              transform: `rotate(${txt.rotation}deg)`,
              cursor: "move",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseDown={() => {
              setActiveIndex(index);
              setActiveType("text");
            }}
            onDoubleClick={() => handleTextDoubleClick(index)}
          >
            {txt.editing ? (
              <input
                type="text"
                autoFocus
                value={txt.content}
                onChange={(e) => handleTextChange(index, e.target.value)}
                onBlur={() => handleTextBlur(index)}
                style={{
                  fontSize: txt.fontSize,
                  color: txt.color,
                  border: "1px dashed gray",
                  outline: "none",
                  background: "transparent",
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    fontSize: txt.fontSize,
                    color: txt.color,
                    cursor: "move",
                    userSelect: "none",
                  }}
                >
                  {txt.content}
                </span>
                <IconButton
                  size="small"
                  className="delete-btn"
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "#fff",
                  }}
                  onClick={() => deleteItem("text", index)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </div>
        ))}

        {/* Moveable */}
        {target && (
          <Moveable
            target={target}
            draggable
            resizable
            rotatable
            keepRatio={true}
            origin={false}
            onDrag={({ top, left }) => {
              if (activeType === "image") {
                setImages((prev) => {
                  const updated = [...prev];
                  updated[activeIndex] = { ...updated[activeIndex], top, left };
                  return updated;
                });
              } else {
                setTexts((prev) => {
                  const updated = [...prev];
                  updated[activeIndex] = { ...updated[activeIndex], top, left };
                  return updated;
                });
              }
            }}
            onResize={({ width, height }) => {
              if (activeType === "image") {
                setImages((prev) => {
                  const updated = [...prev];
                  updated[activeIndex] = {
                    ...updated[activeIndex],
                    width,
                    height,
                  };
                  return updated;
                });
              } else {
                setTexts((prev) => {
                  const updated = [...prev];
                  const text = updated[activeIndex];
                  const scaleX = width / text.width;
                  const newFontSize = Math.max(text.fontSize * scaleX, 5);
                  updated[activeIndex] = {
                    ...text,
                    width,
                    height,
                    fontSize: newFontSize,
                  };
                  return updated;
                });
              }
            }}
            onRotate={({ beforeRotate }) => {
              if (activeType === "image") {
                setImages((prev) => {
                  const updated = [...prev];
                  updated[activeIndex] = {
                    ...updated[activeIndex],
                    rotation: beforeRotate,
                  };
                  return updated;
                });
              } else {
                setTexts((prev) => {
                  const updated = [...prev];
                  updated[activeIndex] = {
                    ...updated[activeIndex],
                    rotation: beforeRotate,
                  };
                  return updated;
                });
              }
            }}
          />
        )}
      </ShirtArea>

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
        onClick={handleDownload}
      >
        Download Design
      </Button>
    </Container>
  );
}
