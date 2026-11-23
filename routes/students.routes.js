const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Student = require("../models/students.model")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb ) => {
        const newFileName = Date.now() + path.extname(file.originalname)
        cb(null, newFileName)
    }
})


const fileFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image/')){
        cb(null, true)
    }else{
        cb(new Error('Only Image are allowed!'), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limit: {
        fileSize: 1024 * 1024 * 3
    }
})

router.get("/", async(req, res) => {
    try{
        const students = await Student.find()
        res.json(students)
    }catch(err){
       res.status(500).json({message: err.message});
    }
})

router.get("/:id", async(req, res) => {
    try{
    const student = await Student.findById(req.params.id)
    if(!student) return res.status(400).json({message: 'Student not found'})    
    res.send(student)
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

router.post("/", upload.single('profile_pic'), async(req, res) => {
    try{
        // const newStudent = await Student.create(req.body)
        const student = new Student(req.body)
        if(req.file){
            student.profile_pic = req.file.filename
        }
        const newStudent = await student.save()
        res.status(201).json(newStudent)
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

router.put("/:id", upload.single('profile_pic'), async(req, res) => {
    try{
        const existingStudent = await Student.findById(req.params.id)
        if(!existingStudent){
            if(req.file.filename){
                const filepath = path.join('./uploads', req.file.filename)
                fs.unlink(filepath, (err) => {
                    if(err) console.log("Failed to Delete image", err)
                })
            }
            return res.status(404).json({message: 'Student not found'})
        } 

        if(req.file){
          if(existingStudent.profile_pic){
            const oldimagepath = path.join('./uploads', existingStudent.profile_pic)
            fs.unlink(oldimagepath, (err) => {
                if(err) console.log("Failed to Delete old image: ", err)
            })
          }

          req.body.profile_pic = req.file.filename
        }

        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body,{new: true})
        res.json(updatedStudent)
    }catch(err){
        res.status(500).json({message: err.message});
    }


})

router.delete("/:id", async(req, res) => {
    try{
        const student = await Student.findByIdAndDelete(req.params.id)
        if(!student) return res.status(404).json({message: "Student not found"})
        
        if(student.profile_pic){
            const filePath = path.join('./uploads', student.profile_pic)
            fs.unlink(filePath, (err) => {
                if(err) console.log("Failed to Delete ", err)
            })
        }
        res.json({message: "Student Deleted"})
    }catch(err){
        res.status(500).json({message: err.message});
    }
})

module.exports = router;