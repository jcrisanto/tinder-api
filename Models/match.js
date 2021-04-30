class Match {
    constructor(sendingLikeId, receivingLikeId) {
        const users = [sendingLikeId, receivingLikeId];
        users.sort();
        this.id = users.join('');
        this.sendingLikeId = sendingLikeId;
        this.receivingLikeId = receivingLikeId;
        this.isApproved = false;
    }

    static fromDB(id, sendingLikeId, receivingLikeId, isApproved) {
        let match = new Match(sendingLikeId, receivingLikeId);
        match.id = id;
        match.isApproved = isApproved;
        return match;
    }
}

module.exports = Match;