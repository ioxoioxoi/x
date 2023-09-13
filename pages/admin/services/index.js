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
    Box, Grid, Switch, List, ListItem, ListItemButton, ListItemText, Divider, TextField, IconButton, Backdrop, CircularProgress,
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  Close,
} from '@mui/icons-material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import Store from 'store';
import axios from 'axios';
import {number_format} from '@/functions/helpers/general'

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

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
  }));

export default function PersistentDrawerLeft() {
    const [loading, setLoading] = React.useState(false)
    const [generalProfit, setGeneralProfit] = React.useState('0.03')
    const [openDialog, setOpenDialog] = React.useState(false)
    const [dataBase, setDataBase] = React.useState([]);
    const [dataBaseTop, setDataBaseTop] = React.useState([]);
    const [totalOrders, setTotalOrders] = React.useState(0);
    const [totalOrdersTimes, setTotalOrdersTimes] = React.useState(0);
    const [totalProfit, setTotalProfit] = React.useState(0);
    const [idTextFocus, setIdTextFocus] = React.useState(0);
    const [valTextFocus, setValTextFocus] = React.useState('');

    const columns = [
      { field: 'no', headerName: 'No.', width: 70},
      { field: 'service_code', headerName: 'Code', width: 150 },
      { field: 'service_name', headerName: 'Service Name', width: 250 },
      { field: 'country', headerName: 'Country', width: 150 },
      {
        field: 'total_order',
        headerName: 'Total Order (Times)',
        type: 'number',
        width: 200,
      },
      {
        field: 'total_amount',
        headerName: 'Total Order (Amount)',
        type: 'number',
        width: 200,
      },
      {
        field: 'total_profit',
        headerName: 'Total Profit',
        type: 'number',
        width: 250,
      },
      // {
      //   field: 'fullName',
      //   headerName: 'Full name',
      //   description: 'This column has a value getter and is not sortable.',
      //   sortable: false,
      //   width: 160,
      //   valueGetter: (params) =>
      //     `${params.row.firstName || ''} ${params.row.lastName || ''}`,
      // },
    ];
  
    const columns2 = [
      { field: 'service_code', headerName: 'Code', width: 70 },
      { field: 'country', headerName: 'Country', width: 150 },
      { field: 'service_name', headerName: 'Service Name', width: 250 },
      { field: 'supplier_price', headerName: 'Supplier Price', width: 150 },
      { field: 'selling_price', headerName: 'Selling Price', width: 150 },
      { field: 'profit', headerName: 'Profit ( '+Store.get('dataCurrency')?.currency_symbol+' )' , width: 150, 
      renderCell: (comp) => {
          return (
         <TextField key={comp?.id} value={(idTextFocus === comp?.id) ? valTextFocus: comp?.value } fullWidth={false} 
         onFocus={() => {
            setIdTextFocus(comp?.id)
            setValTextFocus(comp?.value)
         }} 
         onChange={(e) => (idTextFocus === comp?.id) && setValTextFocus(e?.target?.value)} 
         onBlur={(e) => (valTextFocus != comp?.value) && submitData(e, comp?.id, valTextFocus)} 
         style={{background: '#ececec'}} />
      )}},
      { field: 'is_active', headerName: 'Service Status', width: 150, 
      renderCell: (comp) => {
          return (
         <Switch key={comp?.id} checked={comp?.value === "1"} onChange={(e) => submitData(e, comp?.id, comp?.row?.profit, (comp?.value === '1') ? '0' : '1')} />
      )}},
      { field: 'action', headerName: 'Action', width: 150, 
      renderCell: (comp) => {
          return (
         <Button>Detail</Button>
      )}},
    ];

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_TRANSACTIONS}Orders/top10`, {
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
        const _dataBaseTop = []
        let loop = 1
        res?.data?.data?.top?.map(_data => {
            _data['no'] = loop++
            _data['total_order'] = number_format(_data['total_order'])
            _data['total_amount'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['total_amount'])
            _data['total_profit'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['total_profit'])
            _dataBaseTop.push(_data)
        })
        setTotalOrders(res?.data?.data?.total_amount)
        setTotalProfit(res?.data?.data?.total_profit)
        setTotalOrdersTimes(res?.data?.data?.total_order)
        setDataBaseTop(_dataBaseTop)
        axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/list`, {
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
          const _dataBaseTop = []
          let loop = 1
          res?.data?.data?.map(_data => {
              _data['no'] = loop++
              _data['supplier_price'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['supplier_price'])
              _data['selling_price'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['selling_price'])
              // _data['profit'] = Store.get('dataCurrency')?.currency_symbol + ' ' + number_format(_data['profit'])
              _dataBaseTop.push(_data)
          })
          setDataBase(res?.data?.data)
        })
      })
    } 
  }, [])

  const submitData = (event, id, profit, is_active=undefined) => {
      setLoading(true)
      event.preventDefault()
      const data = new FormData()
      data.append('token_login', Store.get('token'))
      data.append('updated_by', Store.get('auth')?.username)
      data.append('id', id)
      if (typeof profit === 'object' && profit !== null) {
        data.append('profit', profit.target.value)
      } else {
        data.append('profit', profit)
      }
      if (is_active) {
        data.append('is_active', is_active)
      }
      fetch(`${process.env.NEXT_PUBLIC_API_APP}service/update_price`, {
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
        setLoading(false)
        setDataBase(res?.data)
        setOpenDialog(false)
        setGeneralProfit('0.03')
        // setTimeout(() => setLoading(false), 100)        
      })
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main className='main'>
       <h1 style={{fontSize: '28px'}}>
        <b>Services</b>
        
        <span style={{float: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker />
            </LocalizationProvider>
        </span>
       </h1>

       <Box style={{marginTop: '50px'}}>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Item style={{padding: '20px'}}>
                        Total Order Times
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>$ {number_format(totalOrdersTimes)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Item style={{padding: '20px'}}>
                        Total Order Amount
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>$ {number_format(totalOrders)}</h1>
                    </Item>
                </Grid>
                <Grid item xs={4}>
                    <Item style={{padding: '20px'}}>
                        Total Profit
                        <span style={{float: 'right', marginTop: '-5px', marginLeft: '5px', cursor: 'pointer'}}>...</span>
                        <h1 style={{marginTop: '20px', fontSize: '28px', fontWeight: 'bold'}}>$ {number_format(totalProfit)}</h1>
                    </Item>
                </Grid>
            </Grid>
        </Box>

        <hr /><br/>

       <Box style={{marginTop: '20px'}}>

            <h3><b>10 Best Services (Last 7 Days)</b></h3>
            <br/>
            
            <Paper>
                <DataGrid
                    getRowId={(row) => row.service_code}
                    rows={dataBaseTop}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    }}
                    pageSizeOptions={[10, 20]}
                />
            </Paper>

            <br/><hr /><br/>

            <h3><b>Service Management</b>
          <Button
            variant="contained"
            style={{float: 'right'}}
            onClick={() => setOpenDialog(true)}>
            Update All Profit
          </Button></h3>
            <br/>
            
            <Paper>
                <DataGrid
                    // getRowId={(row) => row.service_code}
                    rows={dataBase}
                    columns={columns2}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    }}
                    pageSizeOptions={[10, 20]}
                    // checkboxSelection
                />
            </Paper>
       </Box>
      </Main>
        <Dialog
            aria-labelledby="customized-dialog-title"
            open={openDialog}
          >
            <DialogTitle sx={{ m: 0, p: 2 }}>
              Update All Profit
              <IconButton
                aria-label="close"
                onClick={() => setOpenDialog(false)}
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
              <br/>
              <TextField fullWidth label="Alt Text" variant="outlined" value={generalProfit} onChange={(e) => setGeneralProfit(e.target.value)}  />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button variant='contained' onClick={(e) => submitData(e, 0, generalProfit)} autoFocus>
                Save
              </Button>
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