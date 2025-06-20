import React from 'react';
import { Card, CardContent, Typography, Button, Collapse, Box } from '@mui/material';

export default function TrainingPanel({ onTrain, training, status }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Training</Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2, mb: 1 }}
          onClick={onTrain}
          disabled={training}
        >
          Train Model
        </Button>
        {status && (
          <Typography variant="body2" color="text.secondary">{status}</Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ textTransform: 'none' }}
          >
            Advanced
          </Button>
          <Collapse in={open}>
            <Typography variant="caption" color="text.secondary">
              (Advanced options coming soon)
            </Typography>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
} 