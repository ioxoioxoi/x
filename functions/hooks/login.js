import Router from 'next/router'
import { useState } from "react"
import * as yup from 'yup'

const Hooks = ({props, UpdateData}) => {
    const [alert, setAlert] = useState(false)
    const [alertType, setAlertType] = useState('error')
    const [alertMessage, setAlertMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassLogin, setShowPassLogin] = useState(false)
    const [showPassRegister, setShowPassRegister] = useState(false)
    const [data, setData] = useState({
        email: '',
        password: '',
    })
    const [dataRegister, setDataRegister] = useState({
        name: '',
        bussiness: '',
        email: '',
        password: '',
    })
    
    let schemaData = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().required()
        .min(8, 'Password is too short - should be 8 chars minimum.')
        .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.')
    })
    
    let schemaDataRegister = yup.object().shape({
        name: yup.string().required(),
        bussiness: yup.string().required(),
        email: yup.string().email().required(),
        password: yup.string().required()
        .min(8, 'Password is too short - should be 8 chars minimum.')
        .matches(/[a-zA-Z]/, 'Password can only contain Latin letters.')
    })

    const handleChangeEl = (_key, _val, _type) => {
        const _data = data
        _data[_key] = _val
        if (_type === 'login') {
            setData({..._data})
        } else if (_type === 'register') {
            setDataRegister({..._data})
        }
    }

    const handleForgotPass = (_key, _val) => {
        setAlertType('info')
        setAlertMessage('Under maintenance...')
        setAlert(true)
        setTimeout(() => setAlert(false), 3000)
    }

    const handleSubmit = () => {
        const _props = props
        schemaData.isValid(data)
        .then((valid) => {
            if (valid) {
                setLoading(true)
                fetch('http://localhost:4001/login', {method: 'post', body: JSON.stringify(data)})
                .then((res) => res.json())
                .then((res) => {
                    _props.data = {
                        ..._props.data,
                        merchant: res
                    }
                    console.log('_props', _props)
                    UpdateData(_props.data)
                    setAlertType('success')
                    setAlertMessage('Success message!')
                    setTimeout(() => setLoading(false), 3000)
                    setTimeout(() => setAlert(true), 3000)
                    setTimeout(() => setAlert(false), 8000)
                    setData({
                        email: '',
                        password: '',
                    })
                }).then(() => {
                    Router.push(`/${props?.template}`) 
                })
            } else {
                setAlertType('error')
                setAlertMessage('Fill data correctly!')
                setAlert(true)
                setTimeout(() => setAlert(false), 3000)
            }
        })
    }

    const handleSubmitRegister = () => {
        schemaDataRegister.isValid(dataRegister)
        .then((valid) => {
            if (valid) {
                setLoading(true)
                fetch('/', {method: 'post', body: JSON.stringify(dataRegister)})
                .then(() => {
                    setAlertType('success')
                    setAlertMessage('Success message!')
                    setTimeout(() => setLoading(false), 3000)
                    setTimeout(() => setAlert(true), 3000)
                    setTimeout(() => setAlert(false), 8000)
                    setDataRegister({
                        name: '',
                        bussiness: '',
                        email: '',
                        password: '',
                    })
                })
            } else {
                setAlertType('error')
                setAlertMessage('Fill data correctly!')
                setAlert(true)
                setTimeout(() => setAlert(false), 3000)
            }
        })
    }

    return {
        state: {
            alert: alert,
            alertType: alertType,
            alertMessage: alertMessage,
            loading: loading,
            data: data,
            showPassLogin: showPassLogin,
            showPassRegister: showPassRegister,
        }, 
        handler: {
            handleChangeEl: handleChangeEl,
            handleSubmit: handleSubmit,
            handleForgotPass: handleForgotPass,
            handleSubmitRegister: handleSubmitRegister,
            setShowPassLogin: setShowPassLogin,
            setShowPassRegister: setShowPassRegister,
        }
    }
}

export default Hooks