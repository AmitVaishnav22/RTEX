import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { fabric } from "fabric";

const MyEditor = () => {
  const editorRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  let fabricCanvas = useRef(null);

  const openDrawingCanvas = () => {
    setIsDrawing(true);
    setTimeout(() => {
      if (!fabricCanvas.current) {
        fabricCanvas.current = new fabric.Canvas("drawingCanvas", {
          isDrawingMode: true,
          backgroundColor: "white",
        });
      }
    }, 100);
  };

  const saveDrawing = () => {
    const dataURL = fabricCanvas.current.toDataURL("image/png");
    setIsDrawing(false);
    fabricCanvas.current.clear();

    if (editorRef.current) {
      editorRef.current.insertContent(`<img src="${dataURL}" alt="Drawing" />`);
    }
  };

  return (
    <div>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          height: "80vh",
          width: "100%",
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "print", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "paste", "help", "wordcount",
            "emoticons", "hr", "directionality", "pagebreak", "nonbreaking"
          ],
          toolbar:
            "undo redo | bold italic underline strikethrough | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
            "link image media | forecolor backcolor | formatselect fontselect fontsizeselect | " +
            "blockquote subscript superscript removeformat | charmap emoticons hr pagebreak nonbreaking | " +
            "code fullscreen preview print | customDraw",
          setup: (editor) => {
            editor.ui.registry.addButton("customDraw", {
              text: "Draw",
              onAction: openDrawingCanvas,
            });
          },
          paste_data_images: true,
          automatic_uploads: false,
          content_style: "body { font-family: Arial, sans-serif; font-size: 14px; }",
        }}
      />

      {isDrawing && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "10px",
            zIndex: 1000,
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3>Draw Something</h3>
          <canvas id="drawingCanvas" width="500" height="400" ref={canvasRef}></canvas>
          <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setIsDrawing(false)}>Cancel</button>
            <button onClick={saveDrawing}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEditor;
