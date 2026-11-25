require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const studentRoutes = require('./routes/students.routes')

const connectDB = require("./config/database")
const { MulterError } = require("multer")
const path = require("path")
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({extended: false}))

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.post("/", (req, res) => {
    const data = req.body;
    res.send(`Hello ${data.name}`)
})

app.use('/api/students', studentRoutes)

app.use((error, req, res, next) => {
    if(error instanceof MulterError){
        return res.status(400).send(`Image Error: ${error.message} : ${error.code}`)
    }else if(error){
        return res.status(500).send(`Something went wrong: ${error.message}`)
    }
})

connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err)
        process.exit(1)
    })
