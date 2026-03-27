const { InputOutput } = require('../src/io');
const { getGravatarUrl } = require('../src/utils/gravatar-service');

/**
 * Update users without pictures to use Gravatar
 */
async function updateUsersWithGravatar(io) {
  const collection = io.database.collection('user');

  // Find users without pictures or with null pictures
  const usersWithoutPictures = await collection
    .find({
      $or: [{ picture: null }, { picture: { $exists: false } }],
    })
    .toArray();

  let updatedCount = 0;

  for (const user of usersWithoutPictures) {
    const gravatarUrl = getGravatarUrl(user._id, { size: 80 });

    if (gravatarUrl) {
      await collection.updateOne({ _id: user._id }, { $set: { picture: gravatarUrl } });
      updatedCount++;
    }
  }

  return {
    totalUsers: usersWithoutPictures.length,
    updatedCount,
  };
}

async function migrateUserAvatars() {
  const io = new InputOutput();

  try {
    await io.connect();

    console.log('Starting user avatar migration...');
    const result = await updateUsersWithGravatar(io);

    console.log(`Migration completed:`);
    console.log(`- Total users without pictures: ${result.totalUsers}`);
    console.log(`- Users updated with Gravatar: ${result.updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await io.disconnect();
  }
}

if (require.main === module) {
  migrateUserAvatars();
}

module.exports = migrateUserAvatars;
