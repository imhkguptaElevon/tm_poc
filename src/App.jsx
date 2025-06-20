import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Paper } from '@mui/material';
import ClassManager from './components/ClassManager';
import TrainingPanel from './components/TrainingPanel';
import PreviewPanel from './components/PreviewPanel';
import WebcamCapture from './components/WebcamCapture';
import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import { Button, Dialog, DialogContent, DialogActions, Typography } from '@mui/material';
import { saveAs } from 'file-saver';

function App() {
  const [classes, setClasses] = useState(['Class 1', 'Class 2']);
  const [images, setImages] = useState([[], []]);
  const [training, setTraining] = useState(false);
  const [status, setStatus] = useState('');
  const [canExport, setCanExport] = useState(false);
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [webcamClassIdx, setWebcamClassIdx] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [mobilenet, setMobilenet] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewResult, setPreviewResult] = useState(null);
  const [importDialog, setImportDialog] = useState(false);

  // Load MobileNet and KNN Classifier on mount
  useEffect(() => {
    mobilenetModule.load().then(setMobilenet);
    setClassifier(knnClassifier.create());
  }, []);

  // Webcam and upload handlers (stubbed for now)
  const handleWebcam = idx => {
    setWebcamClassIdx(idx);
    setWebcamOpen(true);
  };
  const handleUpload = (idx, e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = ev => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(imgs => {
      setImages(imgsArr => imgsArr.map((arr, i) => i === idx ? [...arr, ...imgs] : arr));
    });
  };

  // Training handler
  const handleTrain = async () => {
    if (!mobilenet || !classifier) return;
    setTraining(true);
    setStatus('Training...');
    classifier.clearAllClasses();
    for (let classIdx = 0; classIdx < images.length; classIdx++) {
      for (let img of images[classIdx]) {
        const imgEl = new window.Image();
        imgEl.src = img;
        await new Promise(res => { imgEl.onload = res; });
        const activation = mobilenet.infer(imgEl, true);
        classifier.addExample(activation, classes[classIdx]);
      }
    }
    setTraining(false);
    setStatus('Training complete!');
    setCanExport(true);
  };

  // Preview handler
  const handlePreview = () => {
    setPreviewOpen(true);
    setPreviewImg(null);
    setPreviewResult(null);
  };
  const handlePreviewImg = async (img) => {
    setPreviewImg(img);
    if (!mobilenet || !classifier) return;
    const imgEl = new window.Image();
    imgEl.src = img;
    await new Promise(res => { imgEl.onload = res; });
    const activation = mobilenet.infer(imgEl, true);
    const result = await classifier.predictClass(activation);
    setPreviewResult(result);
  };

  // Export handler
  const handleExport = async () => {
    if (!classifier) return;
    const dataset = classifier.getClassifierDataset();
    const datasetObj = {};
    Object.keys(dataset).forEach(key => {
      datasetObj[key] = dataset[key].dataSync();
    });
    const exportObj = {
      dataset: datasetObj,
      classLabels: classes,
    };
    const blob = new Blob([JSON.stringify(exportObj)], { type: 'application/json' });
    saveAs(blob, 'tm-knn-model.json');
  };

  // Import handler
  const handleImport = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const obj = JSON.parse(ev.target.result);
      if (!obj.dataset || !obj.classLabels) return;
      // Recreate tensors
      const newDataset = {};
      Object.keys(obj.dataset).forEach(key => {
        newDataset[key] = tf.tensor(obj.dataset[key], [obj.dataset[key].length / 1024, 1024]);
      });
      classifier.setClassifierDataset(newDataset);
      setClasses(obj.classLabels);
      setImages(obj.classLabels.map(() => []));
      setCanExport(true);
    };
    reader.readAsText(file);
    setImportDialog(false);
  };

  const handleWebcamCapture = img => {
    setImages(imgsArr => imgsArr.map((arr, i) => i === webcamClassIdx ? [...arr, img] : arr));
  };

  return (
    <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh', width: '100vw', py: 4, padding: 0 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <ClassManager
              classes={classes}
              setClasses={setClasses}
              images={images}
              setImages={setImages}
              onWebcam={handleWebcam}
              onUpload={handleUpload}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TrainingPanel
              onTrain={handleTrain}
              training={training}
              status={status}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <PreviewPanel
              canExport={canExport}
              onExport={handleExport}
              onImport={() => setImportDialog(true)}
              classes={classes}
              classifier={classifier}
              mobilenet={mobilenet}
              loading={training}
            />
          </Grid>
        </Grid>
      </Container>
      <WebcamCapture
        open={webcamOpen}
        onClose={() => setWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogContent>
          <Typography variant="h6">Import Model</Typography>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Select File
            <input type="file" accept="application/json" hidden onChange={handleImport} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
