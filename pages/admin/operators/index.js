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
    Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Autocomplete
} from '@mui/material';
import {
  Close,
} from '@mui/icons-material';
import Topbar from '@/components/topbar'
import Sidebar from '@/components/sidebar'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid, GridCellEditStopReasons  } from '@mui/x-data-grid';
import { useRouter } from 'next/router';
import {filter, keys, map, size} from 'lodash';
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
    const [dataBaseAll, setDataBaseAll] = React.useState([]);
    const [idTextFocus, setIdTextFocus] = React.useState(0);
    const [valTextFocus, setValTextFocus] = React.useState('');
    const [countrySelected, setCountrySelected] = React.useState(undefined);

    const columns = [
      { field: 'no', headerName: 'No.', width: 70},
      { field: 'country', headerName: 'Country', width: 150 },
      { field: 'operator_code', headerName: 'Operator Code', width: 250 },
      { field: 'operator_name', headerName: 'Operator Name', width: 550, editable: true}
      // renderCell: (comp) => {
      //     return (
      //    <TextField key={comp?.id} value={(idTextFocus === comp?.id) ? valTextFocus: comp?.value } fullWidth={true} 
      //    onFocus={() => {
      //       setIdTextFocus(comp?.id)
      //       setValTextFocus(comp?.value)
      //    }} 
      //    onChange={(e) => (idTextFocus === comp?.id) && setValTextFocus(e?.target?.value)} 
      //    onBlur={(e) => (valTextFocus != comp?.value) && submitData(e, comp?.id, valTextFocus)} 
      //    style={{background: '#ececec'}} />
      // )}},
    ];

  const router = useRouter();
  React.useEffect(() => {
    if (!Store.get('auth')) {
      router.push('/admin/auth/login');
    } else {
      axios.post(`${process.env.NEXT_PUBLIC_API_APP}service/get_operators_all`, {
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
        const _dataBase = []
        let loop = 1
        // console.log(res?.data?.data)
        res?.data?.data?.map(_data => {
            _data['no'] = loop++
            _dataBase.push(_data)
        })
        // console.log(_dataBase)
        setDataBase(_dataBase)
        setDataBaseAll(_dataBase)
      })
    } 
  }, [])

  const submitData = (id, operator_name) => {
      setLoading(true)
      const data = new FormData()
      data.append('token_login', Store.get('token'))
      data.append('id', id)
      if (typeof operator_name === 'object' && operator_name !== null) {
        data.append('operator_name', operator_name.target.value)
      } else {
        data.append('operator_name', operator_name)
      }
      fetch(`${process.env.NEXT_PUBLIC_API_APP}service/set_operator_name`, {
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
        setDataBaseAll(res?.data)
        if (countrySelected) {
          let _loop = 1
          const results = filter(res?.data, (obj) => {
              if (obj['country']?.toLowerCase()?.indexOf(countrySelected?.toLowerCase()) > -1) {
                obj['no'] = _loop++
                return obj
              }
          })
          setDataBase([...results])
        } else {
          setDataBase([...res?.data])
        }
        setLoading(false)
        // setTimeout(() => setLoading(false), 100)        
      })
  }

  React.useEffect(() => {
    if (countrySelected) {
      let _loop = 1
      const results = filter(dataBaseAll, (obj) => {
          if (obj['country']?.toLowerCase()?.indexOf(countrySelected?.toLowerCase()) > -1) {
            obj['no'] = _loop++
            return obj
          }
      })
      setDataBase([...results])
    } else {
      setDataBase([...dataBaseAll])
    }
  }, [countrySelected])

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar />
      <Sidebar />
      <Main className='main'>
       <h1 style={{fontSize: '28px'}}>
        <b>Operators</b>
       </h1>

       <Box>

            {/* <h3><b>Operator List</b></h3> */}
            <br/>
                <p>
                    {/* <h1><b>{filter(filter(Store.get('all_languages'), ['id_base_language', Store.get('id_base_language')]), ['id_base_language_sentence', '13'])[0]?.translated_text}</b></h1> */}
                    {/* <br/> */}
                           
                    {/* <Button size="small" style={{background: '#0EAC40', color: '#FFFFFF', float: 'right', marginTop: '10px'}} disabled>Download CSV</Button> &nbsp; */}
                    
                    <Autocomplete
                      id="country-select-demo"
                      sx={{ width: 230 }}
                      style={{'display': 'inline-block'}}
                      size="small"
                      onChange={(i, val) => setCountrySelected(val?.label)}
                      options={Store.get('list_countries')?.map(item => ({"label":item.country, "code":item.country_code}))}
                      autoHighlight
                      getOptionLabel={(option) => option.label}
                      renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                          <img
                            loading="lazy"
                            width="20"
                            src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                            srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                            alt=""
                          />
                          {option.label} ({option.code})
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Filter Country"
                          inputProps={{
                            ...params.inputProps,
                            // autoComplete: 'new-password', // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
              
               &nbsp;
               <br/><br/>
                </p>
            
            <Paper>
                <DataGrid
                    rows={dataBase}
                    columns={columns}
                    initialState={{
                      pagination: {
                          paginationModel: { page: 0, pageSize: 10 },
                      },
                    }}
                    pageSizeOptions={[10, 20]}
                    
                    onCellEditStop={(params, event) => {
                      // if (params.reason === GridCellEditStopReasons.cellFocusOut) {
                        // console.log(event)
                        // console.log(event?.target?.value)
                        if (event?.target?.value) {
                          submitData(params?.row?.id, event?.target?.value)
                        } else if (event?.target?.value === '') {
                          submitData(params?.row?.id, '')
                        } else {
                          submitData(params?.row?.id, params?.row?.operator_name)
                        }
                      // }
                    }}
                />
            </Paper>
       </Box>
      </Main>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress style={{color: '#0EAC40'}} thickness={7} size={100} variant="indeterminate" />
          </Backdrop>
    </Box>
  );
}