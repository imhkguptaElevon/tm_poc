import React from 'react';
import { Box, Button } from '@mui/material';
import ClassCard from './ClassCard';

export default function ClassManager({
  classes,
  setClasses,
  images,
  setImages,
  onWebcam,
  onUpload
}) {
  const handleAddClass = () => {
    setClasses([...classes, `Class ${classes.length + 1}`]);
    setImages([...images, []]);
  };
  const handleDelete = idx => {
    setClasses(classes.filter((_, i) => i !== idx));
    setImages(images.filter((_, i) => i !== idx));
  };
  const handleRename = (idx, newName) => {
    setClasses(classes.map((c, i) => (i === idx ? newName : c)));
  };

  return (
    <Box>
      {classes.map((c, idx) => (
        <ClassCard
          key={idx}
          className={c}
          idx={idx}
          onRename={handleRename}
          onDelete={handleDelete}
          onWebcam={onWebcam}
          onUpload={onUpload}
          images={images[idx]}
        />
      ))}
      <Button
        variant="outlined"
        sx={{ mt: 2, width: '100%', borderStyle: 'dashed', color: '#888' }}
        onClick={handleAddClass}
      >
        + Add a class
      </Button>
    </Box>
  );
} 