const User = require("@models/user");

const register = async function (req, res) {
  try {
    console.log(`Creating new user`, req.body, User);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      age: req.body.age,
    });
    await newUser.save();
    const token = await newUser.generateAuthToken();
    res.status(201).send({ newUser, token });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};

const login = async function (req, res) {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login };
