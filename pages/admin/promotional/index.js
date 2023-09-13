import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Box, List, ListItem, ListItemButton, ListItemText, Divider, TextField, IconButton, Backdrop, CircularProgress,
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Close, PhotoCamera,
} from '@mui/icons-material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { useRouter } from 'next/router';
import Store from 'store';
import axios from 'axios';
import ModalImage from "react-modal-image";

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  let loop = 1
  const [loading, setLoading] = React.useState(false)
  const [altText, setAltText] = React.useState('')
  const [openDialog, setOpenDialog] = React.useState(false)
  const [openDialogAdd, setOpenDialogAdd] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState()
  const [dataBase, setDataBase] = React.useState([]);
  const [itemDelete, setItemDelete] = React.useState([]);
  const [iterationImageSelected, setIterationImageSelected] = React.useState('')

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}setting/list_setting_banner`, {
        token_login: Store.get('token')
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      })
      .then((res) => {
        if (res?.data?.error === 'Token is not valid!') {
          setLoading(false)
          Store.set('myInterval', 0);
          Store.remove('auth');
          Store.remove('token');
          Store.remove('api_key');
          alert('Token is not valid or User has been logged in other Device!')
          setTimeout(() => router.push('/admin/auth/login'), 500)
          return false
        }
        setDataBase(res?.data?.data)
      })
    } 
  }, [])

  const handleChoosefile = (event) => {
    if (event?.target?.files[0]) {
      setSelectedFile(event?.target?.files[0])
    }
  }

  const submitData = (event) => {
    if (selectedFile) {
      setLoading(true)
      event.preventDefault()
      const data = new FormData()
      data.append('token_login', Store.get('token'))
      data.append('updated_by', Store.get('auth')?.username)
      data.append('alt_text', altText)
      data.append('userfile', selectedFile, selectedFile.name)
      fetch(`${process.env.NEXT_PUBLIC_API_APP}setting/create_setting_banner`, {
          method: 'POST',
          headers: {
              'Content-Length': `${selectedFile.size}`, // 👈 Headers need to be a string
          },
          body: data,
      }).then((res) => res.json())
      .then((res) =>  {
        if (res?.error === 'Token is not valid!') {
          setLoading(false)
          Store.set('myInterval', 0);
          Store.remove('auth');
          Store.remove('token');
          Store.remove('api_key');
          alert('Token is not valid or User has been logged in other Device!')
          setTimeout(() => router.push('/admin/auth/login'), 500)
          return false
        }
        setDataBase(res?.data)
        setOpenDialogAdd(false)
        setAltText('')
        setSelectedFile()
        setTimeout(() => setLoading(false), 1500)        
      })
    }
  }

  const handleDeleteImage = (item, alt_text) => {
    setItemDelete(item)
    setIterationImageSelected(alt_text)
    setOpenDialog(true)
  }

  const actionDeleteImage = (event) => {
    setLoading(true)
    event.preventDefault()
    const data = new FormData()
    data.append('token_login', Store.get('token'))
    data.append('updated_by', Store.get('auth')?.username)
    data.append('id', itemDelete?.id)
    data.append('is_active', 0)
    fetch(`${process.env.NEXT_PUBLIC_API_APP}setting/update_setting_banner`, {
        method: 'POST',
        body: data,
    }).then((res) => res.json())
    .then((res) =>  {
      if (res?.error === 'Token is not valid!') {
        setLoading(false)
        Store.set('myInterval', 0);
        Store.remove('auth');
        Store.remove('token');
        Store.remove('api_key');
        alert('Token is not valid or User has been logged in other Device!')
        setTimeout(() => router.push('/admin/auth/login'), 500)
        return false
      }
      setDataBase(res?.data)
      setOpenDialog(false)
      setItemDelete()
      setIterationImageSelected()
      setTimeout(() => setLoading(false), 1500)        
    })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main className='main'>
       <h1 style={{fontSize: '28px'}}><b>SEO & Promotional Management</b> 
          <Button
            variant="contained"
            style={{float: 'right'}}
            onClick={() => setOpenDialogAdd(true)}>
            Add new Promotional
          </Button></h1>

       <Box style={{background: '#FFFFFF', marginTop: '20px', borderRadius: '10px'}}>
        
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                <TableRow style={{backgroundColor: '#E6EAEF'}}>
                    <TableCell><b>No.</b></TableCell>
                    <TableCell align="left"><b>Banner</b></TableCell>
                    <TableCell align="left"><b>Alt Text</b></TableCell>
                    <TableCell align="left"><b>Updated By</b></TableCell>
                    <TableCell align="left"><b>Updated Date</b></TableCell>
                    <TableCell align="center"><b>Action</b></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {
                    dataBase?.map((item, index) => (
                      <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                          <TableCell component="th" scope="row">{loop++}</TableCell>
                        <TableCell align="left">
                            <img style={{height: '100px'}} alt={item?.alt_text} src={`${process.env.NEXT_PUBLIC_API_APP}${item?.url_image}`} />
                        </TableCell>
                        <TableCell align="left">{item?.alt_text}</TableCell>
                        <TableCell align="left">{item?.updated_by}</TableCell>
                        <TableCell align="left">{item?.updated_date}</TableCell>
                          <TableCell align="center">
                            <Button color="error" onClick={() => {
                              handleDeleteImage(item, item?.alt_text)
                                }}>
                              Delete
                            </Button>
                          </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
            </Table>
            </TableContainer>
       </Box>
      </Main>
      
      <Dialog
            aria-labelledby="customized-dialog-title"
            open={openDialogAdd}
          >
            <DialogTitle sx={{ m: 0, p: 2 }}>
              Add New Slideshow
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialogAdd(false)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
            {!selectedFile && <><IconButton color="primary" aria-label="upload picture" component="label">
                <input hidden accept="image/*" type="file" onChange={(e) => handleChoosefile(e)} />
                <PhotoCamera />
              </IconButton> &nbsp; 
              {"*Please choose image file!"}
              </>}
              {selectedFile && <>
              <ModalImage
                small={(typeof selectedFile === 'object') ? window?.URL?.createObjectURL(selectedFile) : selectedFile}
                large={(typeof selectedFile === 'object') ? window?.URL?.createObjectURL(selectedFile) : selectedFile}
                alt={altText}
                className="image-thumbnail2"
              /> &emsp;
              <IconButton
                sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                aria-label={`Delete`}
                onClick={() => setSelectedFile()}
                style={{
                  position: 'absolute',
                  top: '80px',
                  right: '25px',
                }}
              >
                <Close style={{color: 'red'}} />
              </IconButton>
              </>}
              <Divider />
              <br/>
              <TextField fullWidth label="Alt Text" variant="outlined" value={altText} onChange={(e) => setAltText(e.target.value)}  />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialogAdd(false)}>Cancel</Button>
              <Button variant='contained' onClick={(e) => submitData(e)} autoFocus>
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirmation"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure want to delete this Promotional {iterationImageSelected} ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} autoFocus>No</Button>
              <Button variant='contained' onClick={(e) => actionDeleteImage(e)}>Yes</Button>
            </DialogActions>
          </Dialog>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </Box>
  );
}