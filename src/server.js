import express from 'express'
import 'dotenv/config'
//import leadsData from './data_input/leads.json' with { type: 'json' }

const app = express()
const route = process.env.ROUTE
const CRM_API_URL = process.env.CRM_API_URL
const PORT = process.env.PORT


app.use(express.json())

app.post(route, async (req, res)=>{
    const leads = req.body
    //const leads = leadsData
    if(!leads.entry || !leads.entry[0].changes){
        return res.status(400).json({ error: 'Bad Request', message: 'The the data is malformed or invalid'})
    }

    const externalID = leads.entry[0].changes[0].value.leadgen_id
    const field_data = leads.entry[0].changes[0].value.field_data
    const fullName = field_data.find(element => element.name === 'full_name')
    const email = field_data.find(element => element.name === 'email')
    const phoneNumber = field_data.find(element => element.name === 'phone_number')
    const companySize = field_data.find(element => element.name === 'company_size')

    const leadsDataClean = {
    client_name: fullName ? fullName.values[0] : 'N/A',
    client_email: email ? email.values[0] : 'N/A',
    client_phone: phoneNumber ? phoneNumber.values[0] : 'N/A',
    meta: {
        source: "Facebook Ads",
        company_size: companySize ? companySize.values[0] : 'N/A',
        external_id: externalID ? externalID : 'N/A'
    }
    }
    try {
        const crmApiResponse = await fetch(CRM_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadsDataClean)
        })
        console.log('status recived from CRM_API: ', crmApiResponse)
        if(crmApiResponse.ok){
           return res.status(201).json({ message: "clean data sent with success" }) 
        }
    } catch (error) {
        console.error('something went wrong when fecthing the clean data: ', error)
        return res.status(500).json({ error: 'something went wrong when fecthing the clean data' })
    }
})

app.listen(PORT, ()=>{
    console.log(`project hosted on http://localhost:${PORT}`)
})