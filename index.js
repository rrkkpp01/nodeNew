const express = require("express")
const app = express()
const studentRoutes = require('./routes/students.routes')

const connectDB = require("./config/database")
const { MulterError } = require("multer")
connectDB()
const PORT = process.env.PORT
console.log("---port---",process.env.PORT)

app.use(express.urlencoded({extended: false}))

app.use(express.json())

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})