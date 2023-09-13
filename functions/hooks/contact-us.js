import * as yup from 'yup'
import { useState } from "react"

const Hooks = (props) => {
    const [alert, setAlert] = useState(false)
    const [alert2, setAlert2] = useState(false)
    const [loading, setLoading] = useState(false)
    const [contactData, setContactData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        description: '',
    })
    
    let schemaData = yup.object().shape({
        name: yup.string().required(),
        email: yup.string().email(),
        phone: yup.number().required().positive().integer(),
        company: yup.string().required(),
        description: yup.string().required(),
    })

    const handleChangeEl = (_key, _val) => {
        const _contactData = contactData
        _contactData[_key] = _val
        setContactData({..._contactData})
    }

    const handleSubmit = (_key, _val) => {
        schemaData.isValid(contactData)
        .then((valid) => {
            if (valid) {
                setLoading(true)
                fetch('/', {method: 'post', body: JSON.stringify(contactData)})
                .then(() => {
                    setTimeout(() => setLoading(false), 3000)
                    setTimeout(() => setAlert(true), 3000)
                    setTimeout(() => setAlert(false), 8000)
                    setContactData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        description: '',
                    })
                })
            } else {
                setAlert2(true)
                setTimeout(() => setAlert2(false), 3000)
            }
        })
    }

    return {
        state: {
            alert: alert,
            alert2: alert2,
            loading: loading,
            contactData: contactData,
        }, 
        handler: {
            handleChangeEl: handleChangeEl,
            handleSubmit: handleSubmit,
        }
    }
}

export default Hooks