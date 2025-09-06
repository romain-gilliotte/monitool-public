const { InputOutput } = require('../src/io');
const { updateUsersWithGravatar } = require('../src/storage/queries/user');

async function migrateUserAvatars() {
  console.log('Starting user avatar migration...');

  const io = new InputOutput();

  try {
    await io.connect();
    console.log('Connected to database');

    const result = await updateUsersWithGravatar(io);

    console.log('Migration completed successfully!');
    console.log(`Found ${result.totalUsers} users without profile pictures`);
    console.log(`Updated ${result.updatedCount} users with Gravatar URLs`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await io.disconnect();
    console.log('Disconnected from database');
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateUserAvatars();
}

module.exports = { migrateUserAvatars };
