import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Place } from '@mui/icons-material';

function AdminForwardLocationInfo({ game }) {
  const cardstyle = game?.status === 'approved' || game?.status === 'lobby' || game?.status === 'cancelled'
  return (
    <Grid item xs={12} md={cardstyle ? 4 : 3}>
      <Card style={{ height: '100%' }}>
        <CardContent>
          <Typography variant='h6' sx={{ mb: 2 }}>
            <Place sx={{ mr: 1, verticalAlign: 'middle' }} />
            Location Details
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <Place color='action' />
              </ListItemIcon>
              <ListItemText primary='Country' secondary={game?.location?.country || 'Not specified'} />
            </ListItem>
            <Divider component='li' />
            <ListItem>
              <ListItemIcon>
                <Place color='action' />
              </ListItemIcon>
              <ListItemText primary='Region' secondary={game?.location?.region || 'Not specified'} />
            </ListItem>
            <Divider component='li' />
            <ListItem>
              <ListItemIcon>
                <Place color='action' />
              </ListItemIcon>
              <ListItemText primary='City' secondary={game?.location?.city || 'Not specified'} />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AdminForwardLocationInfo