const bcrypt = require('bcrypt');

async function genPassword(password) {
  try {
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error during the hashing process:', error);
    throw error;
  }
};

async function validPassword(submittedPassword, storedPassword) {
  try {
    const match = await bcrypt.compare(submittedPassword, storedPassword);

    if (match) {
      console.log('✅ Password is valid.');
    } else {
      console.log('❌ Password is invalid.');
    }
    return match; 
  } catch(error) {
    console.error('Error during the verification of the password', error);
    throw error; 
  }
}

module.exports = { genPassword, validPassword };
