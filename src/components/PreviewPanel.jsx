import React, { useRef, useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Button, Stack, Switch, FormControlLabel, Select, MenuItem, Box, LinearProgress
} from '@mui/material';

export default function PreviewPanel({
  canExport,
  onExport,
  classes: classLabels = [],
  classifier,
  mobilenet,
  loading,
}) {
  const [previewOn, setPreviewOn] = useState(false);
  const [inputSource, setInputSource] = useState('webcam');
  const [webcamActive, setWebcamActive] = useState(false);
  const [fileImg, setFileImg] = useState(null);
  const [probs, setProbs] = useState(null);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  // Start/stop webcam
  useEffect(() => {
    if (previewOn && inputSource === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setWebcamActive(true);
      });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
    };
  }, [previewOn, inputSource]);

  // Real-time prediction loop for webcam
  useEffect(() => {
    if (previewOn && inputSource === 'webcam' && webcamActive && classifier && mobilenet) {
      const predict = async () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        if (video.readyState === 4) {
          const activation = mobilenet.infer(video, true);
          const result = await classifier.predictClass(activation);
          setProbs(result.confidences);
        }
        rafRef.current = requestAnimationFrame(predict);
      };
      rafRef.current = requestAnimationFrame(predict);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [previewOn, inputSource, webcamActive, classifier, mobilenet]);

  // Prediction for file upload
  useEffect(() => {
    if (previewOn && inputSource === 'file' && fileImg && classifier && mobilenet) {
      const imgEl = new window.Image();
      imgEl.src = fileImg;
      imgEl.onload = async () => {
        const activation = mobilenet.infer(imgEl, true);
        const result = await classifier.predictClass(activation);
        setProbs(result.confidences);
      };
    }
  }, [previewOn, inputSource, fileImg, classifier, mobilenet]);

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setFileImg(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Preview</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={previewOn} onChange={e => setPreviewOn(e.target.checked)} disabled={!canExport || loading} />}
            label={previewOn ? 'ON' : 'OFF'}
          />
          <Select
            value={inputSource}
            onChange={e => setInputSource(e.target.value)}
            size="small"
            disabled={!canExport || loading}
          >
            <MenuItem value="webcam">Webcam</MenuItem>
            <MenuItem value="file">File</MenuItem>
          </Select>
          <Button
            variant="outlined"
            startIcon={<span role="img" aria-label="export">⏫</span>}
            disabled={!canExport}
            onClick={onExport}
          >
            Export Model
          </Button>
        </Stack>
        {inputSource === 'webcam' && previewOn && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <video ref={videoRef} autoPlay playsInline width={224} height={168} style={{ borderRadius: 8, background: '#000' }} />
          </Box>
        )}
        {inputSource === 'file' && previewOn && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Button variant="outlined" component="label">
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleFile} />
            </Button>
            {fileImg && <img src={fileImg} alt="preview" width={160} style={{ borderRadius: 8, border: '1px solid #eee', marginTop: 8 }} />}
          </Box>
        )}
        {previewOn && probs && (
          <Box sx={{ mt: 2 }}>
            {classLabels.map((label, i) => (
              <Box key={label} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>{label}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={probs[label] ? probs[label] * 100 : 0}
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {probs[label] ? (probs[label] * 100).toFixed(1) : '0.0'}%
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {!canExport && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            You must train a model on the left before you can preview it here.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 