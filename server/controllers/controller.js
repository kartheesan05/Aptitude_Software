import Questions from "../models/questionSchema.js";
import Results from '../models/resultSchema.js';
import { questionsData, answersData } from '../database/data.js';


/** get all questions */
export async function getQuestions(req, res){
    try {
        const q = await Questions.find();
        res.json(q)
    } catch (error) {
        res.json({ error })
    }
}



// /** insert all questinos */
// export async function insertQuestions(req, res){
//     try {
//         Questions.insertMany({ questions , answers }, function(err, data){
//             res.json({ msg: "Data Saved Successfully" })
//         })
//     } catch (error) {
//         res.json({ error })
        
//     }
// }


export async function insertQuestions(req, res) {
    try {
        Questions.insertMany({ questions: questionsData, answers: answersData });
        res.json({ msg: "Data Saved Successfully" });
    } catch (error) {
        res.json({ error });
    }
}

/** Delete all Questions */
export async function dropQuestions(req, res){
    try {
        await Questions.deleteMany();
        res.json({ msg: "Questions Deleted Successfully" })
    } catch (error) {
        res.json({ error })
    }
}

/** get all result */
export async function getResult(req, res){
    try {
        const r = await Results.find();
        res.json(r)
    } catch (error) {
        res.json({ error })
    }
}

/** post all result */
export async function storeResult(req, res) {
    try {
        const { username, email, dept, result, attempts, points } = req.body;
        if (!username || !email || !dept || !result) {
            throw new Error('Data not provided');
        }

        // Refactor to use async/await
        await Results.create({ username, email, dept, result, attempts, points });

        res.json({ msg: "Result Saved Successfully" });
    } catch (error) {
        console.log(error); // To inspect the error
        res.json({ error: error.message });
    }
}

/** delete all result */
export async function dropResult(req, res){
    try {
        await Results.deleteMany();
        res.json({ msg: "Result Deleted Successfully" })
    } catch (error) {
        res.json({ error })
    }
}