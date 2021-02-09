class match {
    constructor(sendingLikeId, recievingLikeId) {
        this.sendingLikeId = sendingLikeId;
        this.recievingLikeId = recievingLikeId;
    }

    isMatch = (recievingLikeId, sendingLikeId) => this.sendingLikeId === sendingLikeId && this.recievingLikeId === recievingLikeId;

    userHasMatch = (sendingLikeId) => this.sendingLikeId === sendingLikeId || this.recievingLikeId === sendingLikeId;

    exists = (sendingLikeId, recievingLikeId) =>
        (this.sendingLikeId === sendingLikeId && this.recievingLikeId === recievingLikeId) ||
        (this.sendingLikeId === recievingLikeId && this.recievingLikeId === sendingLikeId);
}

module.exports = match;