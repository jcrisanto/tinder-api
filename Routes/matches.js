const express = require('express');
const router = express.Router();
const match = require('./../Models/match');
const fs = require('fs');

let matchRequests = [];
let matches = [];
loadChanges();

router.put('/send-like', (req, res) => {
    const sendingLikeId = req.userId;
    const recievingLikeId = req.body.likedId;

    const foundMatch = matches.find((m) => m.exists(sendingLikeId, recievingLikeId));
    if(foundMatch) {
        res.status(200).send();
        return;
    }

    const isMatchIndex = matchRequests.findIndex((m) => m.isMatch(sendingLikeId, recievingLikeId));
    if (isMatchIndex === -1) {
        const foundMatchRequest = matchRequests.find((m) => m.exists(sendingLikeId, recievingLikeId));
        if(foundMatchRequest) {
            res.status(200).send();
            return;
        }
        matchRequests.push(new match(sendingLikeId, recievingLikeId));
        saveChanges();
        res.status(200).send();
        return;
    }
    matchRequests.splice(isMatchIndex, 1);
    matches.push(new match(recievingLikeId, sendingLikeId));
    saveChanges();
    res.status(200).send('isMatch');
});

router.put('/send-dislike', (req, res) => {
    const sendingLikeId = req.userId;
    const recievingLikeId = req.body.likedId;

    const isMatchIndex = matchRequests.findIndex((m) => m.exists(sendingLikeId, recievingLikeId));
    if(isMatchIndex !== -1) {
        matchRequests.splice(isMatchIndex, 1);
        saveChanges();
        res.status(200).send();
        return;
    }

    const matchExists = matches.findIndex((m) => m.exists(sendingLikeId, recievingLikeId));
    if (matchExists !== -1) {
        matches.splice(isMatchIndex, 1);
        saveChanges();
        res.status(200).send();
        return;
    }
    res.status(200).send();
});

router.get('/', (req, res) => {
    const userId = req.userId;
    const foundMatches = matches.filter(m => m.userHasMatch(userId));
    const userIdsFromMatches = foundMatches.map(m => userId === m.sendingLikeId ? m.recievingLikeId : m.sendingLikeId);
    const fileExists = fs.existsSync("Database/users-table.json");
    const usersFromDb = fileExists ? [...JSON.parse(fs.readFileSync("Database/users-table.json").toString())] : [];
    const usersMatched = usersFromDb.filter(u => userIdsFromMatches.includes(u.id));
    res.status(200).send(usersMatched.map(mapUserDto));
    /* This is a the real syntax, and the one above is a shorter version
    res.status(200).send(usersMatched.map((m) => mapUserDto(m)));
    */
});

function saveChanges() {
    const fileExists = fs.existsSync("Database");
    if(!fileExists) {
        fs.mkdirSync('Database')
    }
    fs.writeFile("Database/match-requests-table.json", JSON.stringify(matchRequests, null, 2), (err) => { console.log(err) });
    fs.writeFile("Database/matches-table.json", JSON.stringify(matches, null, 2), (err) => { console.log(err) });
}

function loadChanges() {
    const matchRequestsFileExists = fs.existsSync("Database/match-requests-table.json");
    if(!matchRequestsFileExists) {
        matchRequests = [];
        return;
    }
    const matchRequestsData = fs.readFileSync("Database/match-requests-table.json");
    matchRequests = [...JSON.parse(matchRequestsData.toString())].map(mapMatch);

    const matchFileExists = fs.existsSync("Database/matches-table.json");
    if(!matchFileExists) {
        matches = [];
        return;
    }
    const matchesData = fs.readFileSync("Database/matches-table.json");
    matches = [...JSON.parse(matchesData.toString())].map(mapMatch);
}

function mapMatch({sendingLikeId, recievingLikeId}) {return new match(sendingLikeId, recievingLikeId)}
function mapUserDto({firstName, lastName, age, email}) {return {firstName, lastName, age, email}}

module.exports = router;