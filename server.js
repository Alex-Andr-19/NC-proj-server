const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const url = require('url')
const queryString = require('querystring')

const sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('./db.sqlite')

function getData(sql, res) {
    let resObj = {
        res: {},
        status: false
    }

    db.all(sql, [], (er, rows) => {
        if (er) {
            console.log(er)
        } else {
            resObj.status = true
            resObj.res = rows
        }

        res.setHeader('Access-Control-Allow-Origin', '*')
        res.json(resObj)
    })
}

function isEqualDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

app.get("/getStudents", (req, res) => {
    let sql = 'SELECT * FROM Student'

    getData(sql, res)
})

app.get("/getTeachers", (req, res) => {
    let sql = 'SELECT * FROM Teacher'

    getData(sql, res)
})

app.get("/getLessons", (req, res) => {
    let sql = 'SELECT * FROM Lesson'

    let resObj = {
        res: {},
        status: false
    }

    db.all(sql, [], (er, rows) => {
        if (er) {
            console.log(er)
        } else {
            resObj.status = true
            resObj.res = rows;

            resObj.res.forEach((l) => {
                let teacher_sql = 'SELECT shortName FROM Teacher WHERE id = (?)'
                db.get(teacher_sql, [l.teacher], (er, row) => {
                    if (er) {
                        console.log(er);
                    } else {
                        l.teacher = row.shortName;

                    }
                })

            })
            let oneDayLessons = [];

            setTimeout(() => {
                rows.forEach(l => {
                    if (oneDayLessons.length === 0) {
                        oneDayLessons.push([l]);
                    } else {
                        let indexCurDay = 0
                        while (!isEqualDate(new Date(oneDayLessons[indexCurDay][0].date), new Date(l.date))) {
                            indexCurDay++;
                            if (indexCurDay === oneDayLessons.length) {
                                break;
                            }
                        }

                        if (indexCurDay === oneDayLessons.length) {
                            oneDayLessons.push([l]);
                        } else {
                            oneDayLessons[indexCurDay].push(l)
                        }
                    }
                });

                resObj.res = oneDayLessons;

                res.setHeader('Access-Control-Allow-Origin', '*')
                res.json(resObj)
            }, 250)
        }

    })
})

app.get("/getGroups", (req, res) => {
    let sql = 'SELECT * FROM "Group"'

    getData(sql, res)
})

app.get("/auth", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let parsedUrl = url.parse(req.url);
    let parsedQS = queryString.parse(parsedUrl.query);

    console.log(parsedQS);
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
