const { getProject } = require('../storage/queries/project');
const { ObjectId } = require('mongodb');

class Profile {
  constructor(io, user) {
    this.io = io;
    this.email = user._id;
    this.name = user.name;
    this.picture = user.picture;
    this.lastSeen = user.lastSeen;
  }

  async isInvitedTo(projectId) {
    try {
      await getProject(this.io, this.email, projectId, { _id: true });
      return true;
    } catch (e) {
      return false;
    }
  }

  async isOwnerOf(projectId) {
    const numProjects = await this.io.database.collection('project').countDocuments({
      _id: new ObjectId(projectId),
      owner: this.email,
    });
    return numProjects === 1;
  }
}

module.exports = Profile;
