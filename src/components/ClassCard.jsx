import React from 'react';
import { Card, CardContent, Typography, IconButton, TextField, Button, Grid } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFile from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ClassCard({
  className,
  onRename,
  onDelete,
  onWebcam,
  onUpload,
  images,
  idx
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(className);

  const handleEdit = () => setEditing(true);
  const handleBlur = () => {
    setEditing(false);
    onRename(idx, value);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            {editing ? (
              <TextField
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={handleBlur}
                size="small"
                autoFocus
                sx={{ width: 120 }}
              />
            ) : (
              <Typography variant="h6" onClick={handleEdit} sx={{ cursor: 'pointer' }}>{className}</Typography>
            )}
          </Grid>
          <Grid item>
            <IconButton onClick={() => onDelete(idx)} size="small"><DeleteIcon /></IconButton>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ mt: 1 }}>Add Image Samples:</Typography>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item>
            <Button variant="outlined" startIcon={<PhotoCamera />} onClick={() => onWebcam(idx)} size="small">Webcam</Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" startIcon={<UploadFile />} component="label" size="small">
              Upload
              <input type="file" accept="image/*" hidden multiple onChange={e => onUpload(idx, e)} />
            </Button>
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {images.map((img, i) => (
            <Grid item key={i}>
              <img src={img} alt={`sample-${i}`} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 