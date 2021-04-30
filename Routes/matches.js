const express = require('express');
const router = express.Router();
const Match = require('./../Models/match');
const DB = require('../Azure DB/DB');

router.put('/send-like', async (req, res) => {
    const sendingLikeId = req.userId;
    const receivingLikeId = req.body.likedId;

    const matchRequest = new Match(sendingLikeId, receivingLikeId);

    const foundMatch = await DB.selectMatchById(matchRequest.id);
    if(foundMatch) {
        if(foundMatch.receivingLikeId === sendingLikeId && !foundMatch.isApproved){
            foundMatch.isApproved = true;
            await DB.approveMatch(foundMatch);
            res.status(200).send('isMatch');
            return;
        }
        res.status(204).send();
        return;
    }
    await DB.insertMatch(matchRequest);
    res.status(204).send();
});

router.put('/send-dislike', async (req, res) => {
    const sendingLikeId = req.userId;
    const receivingLikeId = req.body.likedId;

    const matchRequest = new Match(sendingLikeId, receivingLikeId);
    const foundMatch = await DB.selectMatchById(matchRequest.id);
    if(foundMatch) {
        await DB.deleteMatch(foundMatch.id);
    }
    res.status(200).send();
});

router.get('/', async (req, res) => {
    let foundMatches = (await DB.findMatchesByUserId(req.userId)).filter(x => x.isApproved);
    const usersIdsFromMatches = foundMatches.map(m => req.userId === m.sendingLikeId ? m.receivingLikeId : m.sendingLikeId)

    const usersFromDb = await DB.getAllUsers();
    const userDtos = usersFromDb.filter(u => usersIdsFromMatches.includes(u.id))
    userDtos.forEach((u) => delete u.password);

    res.status(200).send(userDtos);
});

module.exports = router;
